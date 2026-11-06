#!/usr/bin/env node
/**
 * 把 docs/adr/*.md 摘成一份索引，给案例页的"设计决策"标签用。
 * 只提取标题、状态、背景第一段、决定第一条——保证页面上的话和 ADR 原文一致。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ADR_DIR = path.join(ROOT, 'docs/adr');
const OUTPUT = path.join(ROOT, 'src/generated/adr-index.json');

const section = (markdown, heading) => {
  const start = markdown.indexOf(`## ${heading}`);
  if (start === -1) return '';
  const rest = markdown.slice(start + heading.length + 3);
  const end = rest.search(/\n## /);
  return (end === -1 ? rest : rest.slice(0, end)).trim();
};

const firstParagraph = (text) => {
  const blocks = text
    .split('\n\n')
    .map((block) => block.trim())
    .filter((block) => block && !block.startsWith('-') && !block.startsWith('|') && !block.startsWith('```'));
  const first = blocks[0] ?? '';
  // "背景"常常是"一句引子 + 一段解释"，接上第二段更好读
  const needsMore = /[：:]$/.test(first) || first.length < 40;
  return needsMore && blocks[1] ? `${first} ${blocks[1]}` : first;
};

/** 把整节压成一句：去列表符号、并成一行、按句号截断。 */
const summarize = (text, maxChars = 120) => {
  const body = text
    .split('\n')
    .filter((line) => !line.trim().startsWith('|') && !/^\s*-{3,}/.test(line.trim()))
    .join('\n');
  const flat = oneLine(body.replace(/^\s*[-*]\s+/gm, '').replace(/^\s*\d+\.\s+/gm, ''));
  const sentences = flat.split(/(?<=。)/).filter(Boolean);
  let out = '';
  for (const sentence of sentences) {
    if (out && (out + sentence).length > maxChars) break;
    out += sentence;
  }
  return (out || flat).slice(0, maxChars * 1.4).trim();
};

// 只去掉成对的 **加粗**，不要碰 glob 里的 **
const oneLine = (text) =>
  text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

const main = async () => {
  const files = (await fs.readdir(ADR_DIR)).filter((file) => file.endsWith('.md')).sort();
  const entries = [];

  for (const file of files) {
    const raw = await fs.readFile(path.join(ADR_DIR, file), 'utf8');
    const markdown = raw.replace(/```[\s\S]*?```/g, '');
    const titleLine = markdown.split('\n').find((line) => line.startsWith('# ')) ?? '';
    const [id, ...rest] = titleLine.replace(/^#\s*/, '').split('·');
    const status = oneLine(markdown.match(/\*\*状态\*\*[:：]\s*(.+)/)?.[1] ?? '');
    const problem = summarize(section(markdown, '背景'));
    const decision = summarize(section(markdown, '决定'));

    entries.push({
      id: id.trim(),
      title: rest.join('·').trim(),
      status,
      problem,
      decision,
      file: `docs/adr/${file}`,
    });
  }

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');

  console.log('');
  console.log(`  决策索引  ${entries.length} 条 → ${path.relative(ROOT, OUTPUT)}`);
  for (const entry of entries) {
    if (!entry.decision) console.log(`    ! ${entry.id} 没有解析出"决定"，检查 ADR 结构`);
  }
  console.log('');
};

main().catch((error) => {
  console.error(`\n决策索引失败：${error.message}\n`);
  process.exitCode = 1;
});
