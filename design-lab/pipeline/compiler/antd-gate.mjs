/**
 * antd 目标的门禁：覆盖率和对比度。
 *
 * 覆盖率保证「每个语义键都被决定过」——映射，或者写明理由地不映射。
 * 对比度保证投影出来的 ThemeConfig 本身仍然可读，而不是只信源 token 的体检结果。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { classifyVocabulary, projectTheme } from '../../packages/ds-antd/src/index.mjs';
import { contrastRatio } from './qa.mjs';
import { ROOT } from './paths.mjs';

/** 后台里真实存在的文字/底色组合。 */
export const ANTD_PAIRS = [
  { id: 'text.container', fg: 'colorText', bg: 'colorBgContainer', min: 4.5, note: '正文 / 卡片' },
  { id: 'text.layout', fg: 'colorText', bg: 'colorBgLayout', min: 4.5, note: '正文 / 画布' },
  { id: 'text-secondary.container', fg: 'colorTextSecondary', bg: 'colorBgContainer', min: 4.5, note: '次要正文 / 卡片' },
  { id: 'text-tertiary.container', fg: 'colorTextTertiary', bg: 'colorBgContainer', min: 4.5, note: '辅助文字 / 卡片' },
  { id: 'text-light.primary', fg: 'colorTextLightSolid', bg: 'colorPrimary', min: 4.5, note: '主按钮文字' },
  { id: 'link.container', fg: 'colorLink', bg: 'colorBgContainer', min: 4.5, note: '链接 / 卡片' },
  { id: 'success.container', fg: 'colorSuccess', bg: 'colorBgContainer', min: 4.5, note: '成功文字 / 卡片' },
  { id: 'warning.container', fg: 'colorWarning', bg: 'colorBgContainer', min: 4.5, note: '警告文字 / 卡片' },
  { id: 'error.container', fg: 'colorError', bg: 'colorBgContainer', min: 4.5, note: '危险文字 / 卡片' },
  // antd 自己的默认边框就是 1.41:1（#d9d9d9 / #fff），所以这里只检查「边框没有消失」，
  // 真正的可达性由品牌 UI 的 3:1 焦点框承担。
  { id: 'border.container', fg: 'colorBorder', bg: 'colorBgContainer', min: 1.4, note: '边框（不消失检查）' },
];

/** 把 ThemeConfig 里的 CSS 颜色解析回 DTCG 形状，复用同一套对比度实现。 */
export const parseCssColor = (value) => {
  if (typeof value !== 'string') return null;
  const input = value.trim();

  const hex = input.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    const digits = hex[1];
    if (digits.length === 3 || digits.length === 4) {
      const [r, g, b, a] = digits.split('').map((digit) => parseInt(digit + digit, 16) / 255);
      return { components: [r, g, b], alpha: digits.length === 4 ? a : 1 };
    }
    if (digits.length === 6 || digits.length === 8) {
      const components = [0, 2, 4].map((index) => parseInt(digits.slice(index, index + 2), 16) / 255);
      const alpha = digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1;
      return { components, alpha };
    }
    return null;
  }

  const rgba = input.match(/^rgba?\(([^)]+)\)$/i);
  if (rgba) {
    const parts = rgba[1].split(',').map((part) => Number(part.trim()));
    if (parts.length < 3 || parts.slice(0, 3).some((part) => !Number.isFinite(part))) return null;
    return {
      components: parts.slice(0, 3).map((channel) => channel / 255),
      alpha: Number.isFinite(parts[3]) ? parts[3] : 1,
    };
  }

  return null;
};

export const auditThemeContrast = (config) => {
  const results = [];

  for (const pair of ANTD_PAIRS) {
    const fg = parseCssColor(config.token[pair.fg]);
    const bg = parseCssColor(config.token[pair.bg]);

    if (!fg || !bg) {
      results.push({ ...pair, ratio: null, pass: false, reason: '颜色无法解析' });
      continue;
    }

    const ratio = Math.round(contrastRatio(fg, bg) * 100) / 100;
    results.push({ ...pair, ratio, pass: ratio >= pair.min });
  }

  return results;
};

const flattenPaths = (node, prefix = '') => {
  const paths = [];
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    const current = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && ('$value' in value || 'value' in value)) paths.push(current);
    else if (value && typeof value === 'object') paths.push(...flattenPaths(value, current));
  }
  return paths;
};

export const readSemanticVocabulary = async () => {
  const file = path.join(ROOT, 'pipeline/tokens/core/semantic.tokens.json');
  return flattenPaths(JSON.parse(await fs.readFile(file, 'utf8')));
};

/**
 * 跑一遍 antd 目标的全部门禁。返回汇总；有失败项时由调用方决定是否中断编译。
 */
export const auditAntd = async (sets, { vocabulary } = {}) => {
  const paths = vocabulary ?? (await readSemanticVocabulary());
  const coverage = classifyVocabulary(paths);

  const themes = [];
  const failures = [];

  for (const set of sets) {
    const key = `${set.brand}.${set.theme}`;
    if (themes.some((theme) => theme.id === key)) continue;

    const { config, missing } = projectTheme(set);
    const contrast = auditThemeContrast(config);
    const failing = contrast.filter((item) => !item.pass);

    themes.push({ id: key, tokens: Object.keys(config.token).length, pairs: contrast.length, failing: failing.length });
    if (missing.length > 0) failures.push({ id: key, kind: 'missing', detail: missing });
    if (failing.length > 0) failures.push({ id: key, kind: 'contrast', detail: failing });
  }

  if (coverage.unclassified.length > 0) {
    failures.push({ id: 'vocabulary', kind: 'unclassified', detail: coverage.unclassified });
  }

  return {
    coverage,
    themes,
    failures,
    pairs: themes.reduce((total, theme) => total + theme.pairs, 0),
  };
};
