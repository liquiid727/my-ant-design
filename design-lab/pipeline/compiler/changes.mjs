/**
 * 本次编译改了哪些产物：拿工作区里的生成物和 HEAD 比。
 * 只在本地有意义（提交后就归零），所以 changes.json 不进版本库。
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { ROOT } from './paths.mjs';
import { OUTPUT_DIR } from '../pipeline.config.mjs';

const git = (args, cwd) => {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
};

export const collectChanges = async () => {
  const gitRoot = git(['rev-parse', '--show-toplevel'], ROOT)?.trim();
  if (!gitRoot) return { available: false, files: [], summary: { changed: 0, added: 0, removed: 0 } };

  const target = path.relative(gitRoot, path.join(ROOT, OUTPUT_DIR));
  const status = git(['status', '--porcelain', '--', target], gitRoot);
  const numstat = git(['diff', '--numstat', 'HEAD', '--', target], gitRoot) ?? '';
  if (status === null) return { available: false, files: [], summary: { changed: 0, added: 0, removed: 0 } };

  const counts = new Map();
  for (const line of numstat.split('\n')) {
    if (!line.trim()) continue;
    const [added, removed, file] = line.split('\t');
    counts.set(path.basename(file), {
      added: added === '-' ? null : Number(added),
      removed: removed === '-' ? null : Number(removed),
    });
  }

  const files = [];
  for (const line of status.split('\n')) {
    if (!line.trim()) continue;
    const code = line.slice(0, 2).trim();
    const file = line.slice(3).trim();
    if (path.basename(file) === 'changes.json') continue;
    const name = path.relative(path.join(ROOT, OUTPUT_DIR), path.join(gitRoot, file));
    const stat = counts.get(path.basename(file));
    files.push({
      name,
      status: code === '??' ? 'added' : code.includes('D') ? 'deleted' : 'modified',
      added: stat?.added ?? null,
      removed: stat?.removed ?? null,
    });
  }

  files.sort((a, b) => a.name.localeCompare(b.name));
  const summary = {
    changed: files.length,
    added: files.reduce((sum, file) => sum + (file.added ?? 0), 0),
    removed: files.reduce((sum, file) => sum + (file.removed ?? 0), 0),
  };

  return { available: true, files, summary };
};
