#!/usr/bin/env node
/**
 * 页面配方校验的契约测试：示例必须给出预期结果。
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CASES = [
  { file: 'agents/examples/04-ride-home.recipe.json', expect: 0, why: '合法配方应通过' },
  { file: 'agents/examples/05-ride-home-broken.recipe.json', expect: 1, why: '未知组件 / 未知 prop / 非法枚举 / 硬编码颜色都应被拦下' },
];

console.log('');
let failed = 0;
for (const item of CASES) {
  const run = spawnSync(process.execPath, [path.join(ROOT, 'scripts/recipe.mjs'), item.file, '--json'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  const ok = run.status === item.expect;
  if (!ok) failed += 1;
  console.log(`  ${ok ? '✓' : '✗'} ${item.file.padEnd(48)} 退出码 ${run.status}（期望 ${item.expect}）`);
  if (!ok) console.log(`      ${item.why}\n${run.stdout.split('\n').slice(0, 8).join('\n')}`);
}
console.log('');

if (failed) {
  console.log(`  配方门禁契约测试失败：${failed} 条\n`);
  process.exitCode = 1;
} else {
  console.log('  配方门禁按预期工作（1 通过 / 1 拦截）\n');
}
