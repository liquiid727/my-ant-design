#!/usr/bin/env node
/**
 * 提案预检的契约测试：示例提案必须给出预期的通过/失败结果。
 * 任何一条不符合，说明门禁失效了。
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CASES = [
  { file: 'agents/examples/01-add-night-notice.json', expect: 0, why: '合法提案应通过' },
  { file: 'agents/examples/02-break-contrast.json', expect: 1, why: '深绿主色应被对比度拦下' },
  { file: 'agents/examples/03-out-of-whitelist.json', expect: 1, why: '改 space.page 应被白名单拦下' },
];

const results = CASES.map((item) => {
  const run = spawnSync(process.execPath, [path.join(ROOT, 'scripts/proposal.mjs'), item.file, '--json'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return { ...item, code: run.status, output: run.stdout };
});

console.log('');
let failed = 0;
for (const item of results) {
  const ok = item.code === item.expect;
  if (!ok) failed += 1;
  console.log(`  ${ok ? '✓' : '✗'} ${item.file.padEnd(45)} 退出码 ${item.code}（期望 ${item.expect}）`);
  if (!ok) console.log(`      ${item.why}\n${item.output.split('\n').slice(0, 6).join('\n')}`);
}
console.log('');

if (failed) {
  console.log(`  提案门禁契约测试失败：${failed} 条\n`);
  process.exitCode = 1;
} else {
  console.log('  提案门禁按预期工作（1 通过 / 2 拦截）\n');
}
