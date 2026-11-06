/**
 * 时间线：直接读 git log，不再手写节点。
 * 和 changes.json 一样属于"工作区视图"，不进版本库。
 */
import { execFileSync } from 'node:child_process';
import { ROOT } from './paths.mjs';

const git = (args) => {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
};

const LIMIT = 40;

/**
 * 里程碑边界：写的是"这个阶段最后一个提交"。
 * 新提交自动落进最后一段，老边界不用动。
 */
// 没有 tag 时的兜底边界（从新到旧：since 是这一段最老的那个提交）
const FALLBACK_MILESTONES = [
  { label: '站点与收尾', since: 'e20796d' },
  { label: 'M2 · 三轴与抽包', since: 'c025d57' },
  { label: 'M1 · 管线与白标', since: '10f5d7a' },
  { label: '前期 · 主题编辑器', since: '' },
];

/** 去掉 conventional commit 前缀，只留人能读的一句。 */
const humanize = (subject) => subject.replace(/^[a-z]+(\([^)]*\))?:\s*/i, '').trim();

/** feat / refactor / docs … 用来在页面上做筛选。 */
const typeOf = (subject) => (subject.match(/^([a-z]+)(?:\(|:)/i)?.[1] ?? 'other').toLowerCase();

/** 里程碑优先用 git tag：打了标签就算一个阶段，打标签即分阶段。 */
const tagsByCommit = () => {
  // for-each-ref 不支持 %x1f，用 tab 分隔
  const raw = git(['for-each-ref', 'refs/tags', '--format=%(objectname)%09%(refname:short)']);
  const map = new Map();
  if (!raw) return map;
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    const [hash, name] = line.split('\t');
    if (!hash || !name || map.has(hash)) continue;
    // 标签指向的提交日期，用来做"标签 + 日期"双轴
    const date = git(['log', '-1', '--format=%ad', '--date=short', hash])?.trim() ?? null;
    map.set(hash, { name, date });
  }
  return map;
};

export const collectTimeline = async () => {
  const raw = git(['log', `-${LIMIT}`, '--date=short', '--pretty=format:%H%x1f%h%x1f%ad%x1f%s']);

  if (!raw) {
    return { available: false, entries: [] };
  }

  const entries = raw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [full, hash, date, subject] = line.split('\x1f');
      const raw = subject ?? '';
      return { full, hash, date, type: typeOf(raw), subject: humanize(raw), raw };
    });

  const tags = tagsByCommit();

  if (tags.size) {
    // 从新到旧：碰到带 tag 的提交就切换阶段
    let current = { name: '未打标签', date: null };
    for (const entry of entries) {
      const tag = tags.get(entry.full);
      if (tag) current = tag;
      entry.milestone = current.name;
      entry.milestoneDate = current.date;
    }
  } else {
    // 从新到旧扫：遇到某段最老的提交，之后的提交归到更早的阶段
    let cursor = 0;
    for (const entry of entries) {
      const boundary = FALLBACK_MILESTONES.findIndex((item) => item.since === entry.hash);
      if (boundary >= 0) cursor = boundary;
      entry.milestone = FALLBACK_MILESTONES[cursor].label;
      entry.milestoneDate = null; // 由后面的"首发日期"补
      if (boundary >= 0) cursor = Math.min(FALLBACK_MILESTONES.length - 1, boundary + 1);
    }
  }

  // 每个阶段的"首发日期"取该阶段最老那条提交的日期（tag 日期优先，缺了才补）
  const oldestByPhase = new Map();
  for (const entry of [...entries].reverse()) {
    if (!oldestByPhase.has(entry.milestone)) oldestByPhase.set(entry.milestone, entry.date);
  }
  for (const entry of entries) {
    if (!entry.milestoneDate) entry.milestoneDate = oldestByPhase.get(entry.milestone) ?? null;
  }

  const milestones = [...new Set(entries.map((entry) => entry.milestone))];
  return { available: true, source: tags.size ? 'tag' : 'builtin', milestones, entries };
};
