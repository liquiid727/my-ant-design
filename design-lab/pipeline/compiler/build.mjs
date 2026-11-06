#!/usr/bin/env node
/**
 * 编译入口：tokens + 品牌 + 产品 → src/generated/*
 *
 * 用法：npm run tokens
 * 排列 = app（产品语义）× brand（视觉身份）× theme（明暗）
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { APPS, BRANDS, OUTPUT_DIR, PRIVATE_PREFIXES } from '../pipeline.config.mjs';
import { resolveAll } from './resolve.mjs';
import { isPublic } from './format.mjs';
import { runContrast } from './qa.mjs';
import { auditAntd } from './antd-gate.mjs';
import { emitAntd, emitCatalog, emitContext, emitCss, emitDtcg, emitManifest, emitQa, emitTs, emitWxss } from './emit.mjs';
import { ROOT } from './paths.mjs';
import { collectChanges } from './changes.mjs';
import { collectTimeline } from './timeline.mjs';

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const readContracts = async (dir) => {
  const target = path.join(ROOT, dir);
  try {
    const files = (await fs.readdir(target)).filter((file) => file.endsWith('.json')).sort();
    return Promise.all(files.map(async (file) => JSON.parse(await fs.readFile(path.join(target, file), 'utf8'))));
  } catch {
    return [];
  }
};

const main = async () => {
  const started = Date.now();
  const sets = await resolveAll();
  const antdAudit = await auditAntd(sets);

  // 对比度：每个排列各自跑，按 app 汇总
  const qaReports = Object.fromEntries(APPS.map((app) => [app.id, { generatedBy: 'pipeline/compiler', app: app.id, summary: { pairs: 0, failing: 0 }, results: {} }]));
  let failingTotal = 0;
  let pairTotal = 0;

  for (const set of sets) {
    const results = runContrast(set);
    const report = qaReports[set.app];
    report.results[`${set.brand}.${set.theme}`] = results;
    report.summary.pairs += results.length;
    report.summary.failing += results.filter((item) => !item.pass).length;
    pairTotal += results.length;
    failingTotal += results.filter((item) => !item.pass).length;
  }

  const contractsByApp = Object.fromEntries(
    await Promise.all(APPS.map(async (app) => [app.id, await readContracts(app.contracts)])),
  );

  const artifacts = [
    ...(await emitCss(sets)),
    ...(await emitWxss(sets)),
    ...(await emitTs(sets)),
    ...(await emitDtcg(sets)),
    ...(await emitAntd(sets)),
    ...(await emitCatalog(sets)),
    ...(await emitQa(qaReports)),
    ...(await emitContext({ sets, contractsByApp })),
  ];

  const appStats = APPS.map((app) => {
    const appSets = sets.filter((set) => set.app === app.id);
    const base = appSets[0];
    const byLayer = base.tokens.reduce((acc, token) => {
      acc[token.layer] = (acc[token.layer] ?? 0) + 1;
      return acc;
    }, {});
    const darkOverrides = appSets
      .filter((set) => set.theme === 'dark')
      .reduce((total, set) => {
        const light = appSets.find((item) => item.brand === set.brand && item.theme === 'light');
        if (!light) return total;
        return total + set.tokens.filter((token) => JSON.stringify(token.value) !== JSON.stringify(light.byPath.get(token.path)?.value)).length;
      }, 0);
    return {
      id: app.id,
      label: app.label,
      brands: BRANDS.length,
      themes: appSets.length / BRANDS.length,
      tokens: { total: base.tokens.length, public: base.tokens.filter((token) => isPublic(token, PRIVATE_PREFIXES)).length, byLayer },
      darkOverrides,
    };
  });

  // changes.json / timeline.json 都是本地工作区视图（不入库），不算产物
  const changes = await collectChanges();
  const timeline = await collectTimeline();
  await fs.mkdir(path.join(ROOT, OUTPUT_DIR), { recursive: true });
  await fs.writeFile(path.join(ROOT, OUTPUT_DIR, 'changes.json'), `${JSON.stringify(changes, null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(ROOT, OUTPUT_DIR, 'timeline.json'), `${JSON.stringify(timeline, null, 2)}\n`, 'utf8');

  artifacts.push(
    await emitManifest({
      generatedBy: 'pipeline/compiler · design-lab',
      permutations: sets.length,
      apps: appStats,
      contrast: { pairs: pairTotal, failing: failingTotal },
      artifacts,
    }),
  );

  console.log('');
  console.log(`  Token 编译  ${sets.length} 套排列 = ${APPS.length} app × ${BRANDS.length} 品牌 × 2 主题`);
  for (const app of appStats) {
    console.log(`  ${app.label}（${app.id}）  ${app.tokens.total} 个 token，公开 ${app.tokens.public}，深色覆盖 ${app.darkOverrides}`);
  }
  console.log('');

  const groups = [
    ['Web', artifacts.filter((item) => item.file.endsWith('.css'))],
    ['小程序', artifacts.filter((item) => item.file.endsWith('.wxss'))],
    ['类型', artifacts.filter((item) => item.file.endsWith('.ts'))],
    ['DTCG', artifacts.filter((item) => item.file.includes('/dtcg/'))],
    ['antd', artifacts.filter((item) => item.file.includes('/antd/'))],
    ['派生', artifacts.filter((item) => /catalog|qa|design-context|manifest/.test(item.file))],
  ];

  for (const [label, items] of groups) {
    const bytes = items.reduce((total, item) => total + item.bytes, 0);
    console.log(`  ${label.padEnd(6)} ${String(items.length).padStart(2)} 个文件  ${kb(bytes).padStart(9)}`);
  }
  console.log('');

  if (failingTotal) {
    console.log(`  ✗ 对比度不达标 ${failingTotal} 项：`);
    for (const set of sets) {
      for (const item of qaReports[set.app].results[`${set.brand}.${set.theme}`] ?? []) {
        if (!item.pass) console.log(`    ${set.app}.${set.brand}.${set.theme} · ${item.id} = ${item.ratio} : 1，需要 ${item.min}（${item.note}）`);
      }
    }
    console.log('');
    process.exitCode = 1;
    return;
  }

  if (antdAudit.failures.length > 0) {
    console.log('  ✗ antd 投影门禁未通过：');
    for (const failure of antdAudit.failures) {
      if (failure.kind === 'unclassified') {
        console.log(`    语义键没有决定去向：${failure.detail.join(', ')}`);
        console.log('    在 packages/ds-antd 的 TOKEN_MAP 里映射，或在 EXCLUDED 里写明理由。');
      } else if (failure.kind === 'missing') {
        console.log(`    ${failure.id} 缺少 token：${failure.detail.join(', ')}`);
      } else {
        for (const item of failure.detail) {
          console.log(`    ${failure.id} · ${item.id} = ${item.ratio} : 1，需要 ${item.min}（${item.note}）`);
        }
      }
    }
    console.log('');
    process.exitCode = 1;
    return;
  }

  console.log(
    changes.summary.changed
      ? `  · 本次编译改动 ${changes.summary.changed} 个产物（+${changes.summary.added} / −${changes.summary.removed} 行）`
      : '  · 本次编译没有产物变化',
  );
  console.log(`  ✓ 对比度 ${pairTotal} 组配对全部达标`);
  console.log(
    `  ✓ antd 投影 ${antdAudit.themes.length} 套 · 语义覆盖 ${antdAudit.coverage.mapped}/${antdAudit.coverage.total}` +
      `（${antdAudit.coverage.excluded.length} 条显式排除）· 对比度 ${antdAudit.pairs} 组`,
  );
  console.log(`  ✓ 产物已写入 ${OUTPUT_DIR}/`);
  console.log(`  用时 ${Date.now() - started}ms`);
  console.log('');
};

main().catch((error) => {
  console.error(`\n编译失败：${error.message}\n`);
  process.exitCode = 1;
});
