#!/usr/bin/env node
/**
 * 编译入口：tokens/*.json → src/generated/*
 *
 * 用法：npm run tokens
 * 出口：4 个目标产物（css / wxss / ts / dtcg）+ 3 个派生产物（catalog / qa / design-context）
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { BRANDS, OUTPUT_DIR, PRIVATE_PREFIXES } from '../pipeline.config.mjs';
import { resolveAll } from './resolve.mjs';
import { isPublic } from './format.mjs';
import { runContrast } from './qa.mjs';
import { emitCatalog, emitContext, emitCss, emitDtcg, emitManifest, emitQa, emitTs, emitWxss } from './emit.mjs';
import { ROOT } from './paths.mjs';

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const readContracts = async (brandId) => {
  const dir = path.join(ROOT, brandId, 'contracts');
  try {
    const files = (await fs.readdir(dir)).filter((file) => file.endsWith('.json')).sort();
    return Promise.all(files.map(async (file) => JSON.parse(await fs.readFile(path.join(dir, file), 'utf8'))));
  } catch {
    return [];
  }
};

const readAllContracts = async () => {
  const entries = await Promise.all(BRANDS.map(async (brand) => [brand.id, await readContracts(brand.id)]));
  return Object.fromEntries(entries);
};

const main = async () => {
  const started = Date.now();
  const sets = await resolveAll();

  const contrast = {};
  for (const set of sets) {
    const results = runContrast(set);
    contrast[`${set.brand}.${set.theme}`] = results;
  }

  const all = Object.values(contrast).flat();
  const failing = all.filter((item) => !item.pass);
  const contrastReport = {
    generatedBy: 'pipeline/compiler',
    summary: { pairs: all.length, failing: failing.length },
    results: contrast,
  };

  const contractsByBrand = await readAllContracts();

  const artifacts = [
    await emitCss(sets),
    await emitWxss(sets),
    await emitTs(sets),
    ...(await emitDtcg(sets)),
    await emitCatalog(sets),
    await emitQa(contrastReport),
    ...(await emitContext({ sets, contractsByBrand, contrastReport })),
  ];

  const base = sets[0];
  const byLayer = base.tokens.reduce((acc, token) => {
    acc[token.layer] = (acc[token.layer] ?? 0) + 1;
    return acc;
  }, {});
  const darkOverrides = sets
    .filter((set) => set.theme === 'dark')
    .reduce((total, set) => {
      const changed = set.tokens.filter((token) => {
        const light = base.byPath.get(token.path);
        return light && JSON.stringify(light.value) !== JSON.stringify(token.value);
      }).length;
      return total + changed;
    }, 0);

  artifacts.push(
    await emitManifest({
      generatedBy: 'pipeline/compiler · design-lab',
      permutations: sets.length,
      tokens: { total: base.tokens.length, public: base.tokens.filter((token) => isPublic(token, PRIVATE_PREFIXES)).length, byLayer },
      darkOverrides,
      contrast: { pairs: contrastReport.summary.pairs, failing: contrastReport.summary.failing },
      artifacts,
    }),
  );
  const publicTokens = base.tokens.filter((token) => isPublic(token, PRIVATE_PREFIXES));
  const overridden = sets
    .filter((set) => set.theme === 'dark')
    .map((set) => {
      const changed = set.tokens.filter((token) => {
        const light = base.byPath.get(token.path);
        return light && JSON.stringify(light.value) !== JSON.stringify(token.value);
      }).length;
      return `${set.brand}·dark 覆盖 ${changed}`;
    })
    .join(' · ');

  console.log('');
  console.log(`  Token 编译  ${sets.length} 套排列 · ${base.tokens.length} 个 token（公开 ${publicTokens.length}）`);
  console.log(`  ${overridden}`);
  console.log('');
  for (const artifact of artifacts) {
    console.log(`  ${path.relative(ROOT, artifact.file).padEnd(46)} ${kb(artifact.bytes).padStart(9)}`);
  }
  console.log('');

  if (failing.length) {
    console.log(`  ✗ 对比度不达标 ${failing.length} 项：`);
    for (const item of failing) {
      console.log(`    ${item.id.padEnd(30)} ${String(item.ratio).padStart(6)} : 1  需要 ${item.min}  （${item.note}）`);
    }
    console.log('');
    process.exitCode = 1;
    return;
  }

  console.log(`  ✓ 对比度 ${all.length} 组配对全部达标`);
  console.log(`  ✓ 产物已写入 ${OUTPUT_DIR}/`);
  console.log(`  用时 ${Date.now() - started}ms`);
  console.log('');
};

main().catch((error) => {
  console.error(`\n编译失败：${error.message}\n`);
  process.exitCode = 1;
});
