#!/usr/bin/env node
/**
 * 把 design-lab 的 antd 投影同步进 studio。
 *
 * design-lab 是唯一真源，这里只做拷贝、不做转换：
 * 产物原样落进 src/themes/lab/，再用一个 index.ts 把它们列出来。
 * 找不到 design-lab（例如独立部署 studio）时跳过，保留已提交的副本。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.resolve(ROOT, '../design-lab/src/generated/antd');
const TARGET = path.join(ROOT, 'src/themes/lab');

const exists = async (dir) => {
  try {
    await fs.access(dir);
    return true;
  } catch {
    return false;
  }
};

const main = async () => {
  if (!(await exists(SOURCE))) {
    console.log(`  · 未找到 ${path.relative(ROOT, SOURCE)}，跳过 lab 主题同步`);
    return;
  }

  const files = (await fs.readdir(SOURCE)).filter((file) => file.endsWith('.json')).sort();
  if (files.length === 0) {
    console.log('  · design-lab 没有 antd 产物，跳过同步');
    return;
  }

  await fs.mkdir(TARGET, { recursive: true });

  const entries = [];
  for (const file of files) {
    const content = await fs.readFile(path.join(SOURCE, file), 'utf8');
    const config = JSON.parse(content);
    if (!config.id || !config.token || !config.components) {
      throw new Error(`antd 产物格式不符：${file}`);
    }
    await fs.writeFile(path.join(TARGET, file), content, 'utf8');
    entries.push({ file, id: config.id });
  }

  const imports = entries
    .map((entry, index) => `import theme${index} from './${entry.file}';`)
    .join('\n');
  const names = entries.map((entry, index) => `  theme${index},`).join('\n');

  const index = [
    '// 由 scripts/sync-lab-themes.mjs 生成，请勿手改。改动请落在 design-lab 的 tokens 源。',
    imports,
    '',
    'export const labThemeConfigs = [',
    names,
    '] as const;',
    '',
  ].join('\n');

  await fs.writeFile(path.join(TARGET, 'index.ts'), index, 'utf8');
  console.log(`  · lab 主题已同步 ${entries.length} 套：${entries.map((entry) => entry.id).join('、')}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
