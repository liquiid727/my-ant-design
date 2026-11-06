#!/usr/bin/env node
/**
 * Token 变更提案（TCP）预检：不改任何文件，只回答"如果按这个提案改，会发生什么"。
 *
 *   npm run proposal -- agents/examples/01-add-night-tone.json
 *   npm run proposal -- agents/examples/02-break-contrast.json --json
 *
 * 输出：结构校验 / 白名单 / 受影响的排列 / 对比度新增失败 / 主题完整性。
 * 有 error 时退出码 1 —— 这就是 Agent 提交改动前的门。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { BRANDS, BRAND_OVERRIDE_ALLOWLIST } from '../pipeline/pipeline.config.mjs';
import { resolveBrandTheme } from '../pipeline/compiler/resolve.mjs';
import { runContrast } from '../pipeline/compiler/qa.mjs';
import { ROOT } from '../pipeline/compiler/paths.mjs';
import { formatValue, isPublic } from '../pipeline/compiler/format.mjs';
import { PRIVATE_PREFIXES } from '../pipeline/pipeline.config.mjs';

const OPS = new Set(['add', 'set', 'deprecate']);
const THEMES = new Set(['light', 'dark', 'both']);
const PATH_RE = /^[a-z][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)+$/;

const allowedForBrand = (tokenPath) =>
  BRAND_OVERRIDE_ALLOWLIST.some((prefix) =>
    prefix.endsWith('.') ? tokenPath.startsWith(prefix) : tokenPath === prefix || tokenPath.startsWith(`${prefix}.`),
  );

const setPath = (tree, segments, value) => {
  let node = tree;
  for (const segment of segments.slice(0, -1)) {
    node[segment] ??= {};
    node = node[segment];
  }
  node[segments.at(-1)] = value;
};

const validate = (proposal) => {
  const errors = [];
  const warnings = [];

  if (!proposal || typeof proposal !== 'object') return { errors: ['提案不是一个对象'], warnings };
  for (const field of ['id', 'intent', 'changes']) {
    if (!proposal[field]) errors.push(`缺少字段 ${field}`);
  }
  if (!Array.isArray(proposal.changes) || proposal.changes.length === 0) errors.push('changes 必须是非空数组');
  if (!proposal.rationale) warnings.push('建议补 rationale：评审时最先看的就是它');

  const brand = proposal.scope?.brand;
  if (!brand || !BRANDS.some((item) => item.id === brand)) errors.push(`scope.brand 必须是 ${BRANDS.map((b) => b.id).join(' / ')}`);
  if (proposal.scope?.theme && !THEMES.has(proposal.scope.theme)) errors.push('scope.theme 只能是 light / dark / both');

  for (const [index, change] of (proposal.changes ?? []).entries()) {
    const at = `changes[${index}]`;
    if (!OPS.has(change.op)) errors.push(`${at}.op 只能是 add / set / deprecate`);
    if (!change.path || !PATH_RE.test(change.path ?? '')) errors.push(`${at}.path 不合法：${change.path}`);
    if (change.op !== 'deprecate') {
      if (!change.type) errors.push(`${at}.type 必填（color / dimension / duration / cubicBezier …）`);
      if (change.value == null) errors.push(`${at}.value 必填`);
    }
    if (change.op === 'add' && change.type === 'color' && typeof change.value === 'string' && !change.value.startsWith('{') && !change.value.startsWith('#')) {
      errors.push(`${at}.value 颜色要么是 #hex，要么是别名 {color.ramp.*}`);
    }
    if (change.layer === 'component' && typeof change.value === 'string' && /^(color\.ramp|brand\.palette)\./.test(change.value.replace(/[{}]/g, ''))) {
      errors.push(`${at}: 组件层不允许引用原色 ${change.value}`);
    }
  }

  return { errors, warnings };
};

const toPatch = (changes) => {
  const tree = {};
  for (const change of changes) {
    if (change.op === 'deprecate') continue;
    const segments = change.path.split('.');
    setPath(tree, segments, { $type: change.type, $value: change.value });
  }
  return tree;
};

const summarize = (before, after) => {
  const changed = [];
  for (const token of after.tokens) {
    const previous = before.byPath.get(token.path);
    if (!previous) {
      changed.push({ path: token.path, kind: 'added', from: null, to: formatValue(token, 'web') });
      continue;
    }
    if (JSON.stringify(previous.value) !== JSON.stringify(token.value)) {
      changed.push({ path: token.path, kind: 'changed', from: formatValue(previous, 'web'), to: formatValue(token, 'web') });
    }
  }
  for (const token of before.tokens) if (!after.byPath.has(token.path)) changed.push({ path: token.path, kind: 'removed', from: formatValue(token, 'web'), to: null });
  return changed;
};

const main = async () => {
  const args = process.argv.slice(2);
  const file = args.find((arg) => !arg.startsWith('--'));
  const asJson = args.includes('--json');

  if (!file) {
    console.error('用法：npm run proposal -- <提案.json> [--json]');
    process.exitCode = 1;
    return;
  }

  const proposal = JSON.parse(await fs.readFile(path.resolve(process.cwd(), file), 'utf8'));
  const { errors, warnings } = validate(proposal);
  const brandId = proposal.scope?.brand;
  const brand = BRANDS.find((item) => item.id === brandId);
  const scopeTheme = proposal.scope?.theme ?? 'both';
  const themes = scopeTheme === 'both' ? ['light', 'dark'] : [scopeTheme];

  const patch = toPatch(proposal.changes ?? []);
  // 只改声明的主题：light-only 的提案不能偷偷改深色
  const patchFor = (theme) => (scopeTheme === 'both' || scopeTheme === theme ? patch : {});
  const report = {
    proposal: proposal.id,
    intent: proposal.intent,
    brand: brandId,
    themes,
    errors,
    warnings,
    permutations: [],
    contrast: { before: 0, after: 0, newFailures: [] },
    themeParity: [],
    whitelist: [],
  };

  if (!errors.length && brand) {
    for (const change of proposal.changes) {
      if (change.op !== 'deprecate' && !allowedForBrand(change.path)) {
        report.whitelist.push(`${change.path} 不在品牌白名单，请补 ADR 或改为覆盖语义层`);
      }
    }

    for (const theme of themes) {
      const before = await resolveBrandTheme(brand, theme);
      const after = await resolveBrandTheme(brand, theme, patch);
      const changed = summarize(before, after);
      report.permutations.push({
        permutation: `${brand.id}.${theme}`,
        changed: changed.length,
        details: changed.slice(0, 24),
      });

      const beforeFailures = runContrast(before).filter((item) => !item.pass).map((item) => item.id);
      const afterResults = runContrast(after);
      const afterFailures = afterResults.filter((item) => !item.pass);
      report.contrast.before += beforeFailures.length;
      report.contrast.after += afterFailures.length;
      for (const failure of afterFailures) {
        if (!beforeFailures.includes(failure.id)) {
          report.contrast.newFailures.push({ permutation: `${brand.id}.${theme}`, id: failure.id, ratio: failure.ratio, min: failure.min, note: failure.note });
        }
      }
    }
  }

  if (!errors.length && brand) {
    // 主题完整性：light / dark 的键集合必须一致，只改一边会被拦下
    const light = await resolveBrandTheme(brand, 'light', patchFor('light'));
    const dark = await resolveBrandTheme(brand, 'dark', patchFor('dark'));
    const lightKeys = new Set(light.tokens.map((token) => token.path));
    const darkKeys = new Set(dark.tokens.map((token) => token.path));
    for (const key of lightKeys) if (!darkKeys.has(key)) report.themeParity.push(`dark 缺少 ${key}`);
    for (const key of darkKeys) if (!lightKeys.has(key)) report.themeParity.push(`light 缺少 ${key}`);
  }

  const blocking =
    errors.length > 0 || report.whitelist.length > 0 || report.contrast.newFailures.length > 0 || report.themeParity.length > 0;

  if (asJson) {
    console.log(JSON.stringify({ ...report, blocking }, null, 2));
    process.exitCode = blocking ? 1 : 0;
    return;
  }

  console.log('');
  console.log(`  TCP  ${proposal.id ?? '(无 id)'}  —  ${proposal.intent ?? '(无 intent)'}`);
  console.log(`  品牌 ${brandId ?? '?'} · 主题 ${themes.join('/')} · ${proposal.changes?.length ?? 0} 处改动`);
  console.log('');

  if (errors.length) {
    console.log('  ✗ 结构校验');
    for (const error of errors) console.log(`      ${error}`);
  } else {
    console.log('  ✓ 结构校验');
  }

  if (report.whitelist.length) {
    console.log('  ✗ 品牌白名单');
    for (const item of report.whitelist) console.log(`      ${item}`);
  } else if (!errors.length) {
    console.log('  ✓ 品牌白名单');
  }

  for (const item of report.permutations) {
    console.log(`  · ${item.permutation.padEnd(16)} ${item.changed} 个值变化`);
    for (const detail of item.details) {
      const mark = detail.kind === 'added' ? '+' : detail.kind === 'removed' ? '−' : '~';
      console.log(`      ${mark} ${detail.path.padEnd(34)} ${detail.from ?? '—'} → ${detail.to ?? '—'}`);
    }
  }

  if (report.contrast.newFailures.length) {
    console.log('  ✗ 对比度');
    for (const item of report.contrast.newFailures) {
      console.log(`      ${item.permutation} · ${item.id} = ${item.ratio}:1（需要 ${item.min}:1）${item.note}`);
    }
  } else if (!errors.length) {
    console.log('  ✓ 对比度（没有新增失败）');
  }

  if (report.themeParity.length) {
    console.log('  ✗ 主题完整性');
    for (const item of report.themeParity.slice(0, 8)) console.log(`      ${item}`);
    if (report.themeParity.length > 8) console.log(`      …另有 ${report.themeParity.length - 8} 条`);
  } else if (!errors.length) {
    console.log('  ✓ 主题完整性');
  }

  for (const warning of warnings) console.log(`  · 提示：${warning}`);
  console.log('');

  if (blocking) {
    console.log('  提案未通过预检。改完再跑一次，不要直接落盘。\n');
    process.exitCode = 1;
    return;
  }
  console.log('  预检通过。落盘方式：改对应 tokens 源文件 → npm run verify → npm run visual\n');
};

main().catch((error) => {
  console.error(`\n预检失败：${error.message}\n`);
  process.exitCode = 1;
});
