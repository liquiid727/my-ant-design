import { useEffect, useState } from 'react';
import timelineJson from '../generated/timeline.json';
import { Button } from '../components/controls';
import { navigate } from '../lib/router';
import { apps, manifest } from './model';

const PROBLEMS = [
  {
    title: '改一处颜色，要改十几个地方',
    body: '设计稿改了，代码里散落着硬编码；下次再改，没人记得哪里漏了。',
    answer: '颜色、字号、间距只写一份 JSON，四个平台由编译器产出。',
  },
  {
    title: '多端、多品牌，组件被复制成好几套',
    body: '小程序一套、H5 一套、换个品牌再来一套，修 bug 要修三遍。',
    answer: '组件只认语义层；品牌是变量，产品是业务语义，页面结构不动。',
  },
  {
    title: 'AI 写的界面，一次一个样子',
    body: '模型每次都可能发明新的绿色、新的圆角，产出好看却不成体系。',
    answer: '模型只能引用已有 token；提案与配方在落盘前被机器拦一遍。',
  },
];

const DELIVERS = [
  { label: '一份源', value: '6 层 JSON', note: 'primitive / semantic / brand / product / component / layout' },
  { label: '四类产物', value: 'CSS · WXSS · TS · DTCG', note: '按产品拆分，只导出业务可见变量' },
  { label: '七道门禁', value: 'verify', note: '对比度、分层、白名单、硬编码、契约…' },
  { label: '两个闭环', value: '提案 · 配方', note: 'AI 想改 token 或拼页面，先过预检' },
];

const NOT = [
  { title: '不是 Figma 插件', body: '它不读设计稿，也不生成 Figma 图层；设计稿只是参考，定义落在 JSON 里。' },
  { title: '不是通用组件库', body: '组件只够这两个产品用，API 按契约收窄，不追求"什么场景都能拼"。' },
  { title: '不是低代码平台', body: '页面还是人和 AI 写代码，只是写之前先有契约、写之后先过门禁。' },
  { title: '不是黑盒代码生成', body: '产物全部提交入库，diff 就是评审对象；生成器不替你决定长什么样。' },
];

const STACK = ['DTCG 2025.10', 'Style Dictionary', 'Vite + React', 'Playwright', '微信小程序 WXSS'];

type TimelineEntry = { hash: string; date: string; type: string; subject: string; milestone: string; milestoneDate: string | null };

const TYPE_LABEL: Record<string, string> = {
  feat: '功能',
  fix: '修复',
  refactor: '重构',
  docs: '文档',
  test: '测试',
  other: '其他',
};

/** 每组默认显示这几条，其余折叠。 */
const VISIBLE_PER_GROUP = 5;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** 整词匹配：前后不能紧挨字母/数字（中文、空格、标点都算边界）。 */
const WORD = '[A-Za-z0-9]';
const termPattern = (term: string) => new RegExp(`(?<!${WORD})${escapeRegExp(term)}(?!${WORD})`, 'i');
const matchesTerm = (haystack: string, term: string) => termPattern(term).test(haystack);

/** 相关度：标题命中 2 分，hash / 阶段命中 1 分。 */
const relevance = (entry: { subject: string; hash: string; milestone: string }, terms: string[]) =>
  terms.reduce(
    (score, term) =>
      score +
      (matchesTerm(entry.subject, term) ? 2 : 0) +
      (matchesTerm(entry.hash, term) || matchesTerm(entry.milestone, term) ? 1 : 0),
    0,
  );

/** 把命中的关键词包成 mark，支持多词。 */
const highlight = (text: string, terms: string[]) => {
  if (!terms.length) return text;
  const pattern = new RegExp(`(?<!${WORD})(${terms.map(escapeRegExp).join('|')})(?!${WORD})`, 'gi');
  const lower = new Set(terms.map((term) => term.toLowerCase()));
  return text.split(pattern).map((part, index) =>
    lower.has(part.toLowerCase()) ? (
      <mark className="timeline-mark" key={`${part}-${index}`}>
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );
};

type Preset = { id: string; label: string; type?: string; by?: string; q?: string; phase?: string; locked?: boolean };

const PRESET_KEY = 'design-lab:timeline-presets';

const BUILTIN_PRESETS: Preset[] = [
  { id: 'builtin-fix', label: '只看修复', type: 'fix' },
  { id: 'builtin-feat-milestone', label: '功能 · 按阶段', type: 'feat', by: 'milestone' },
];

const readPresets = (): Preset[] => {
  try {
    const raw = window.localStorage.getItem(PRESET_KEY);
    return raw ? (JSON.parse(raw) as Preset[]) : [];
  } catch {
    return [];
  }
};

const writePresets = (presets: Preset[]) => {
  try {
    window.localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
  } catch {
    // 隐私模式下写不进去就算了，不影响主流程
  }
};

const presetHash = (preset: Preset) => {
  const params = new URLSearchParams();
  if (preset.type) params.set('type', preset.type);
  if (preset.by) params.set('by', preset.by);
  if (preset.q) params.set('q', preset.q);
  if (preset.phase) params.set('phase', preset.phase);
  return params.toString() ? `/about?${params.toString()}` : '/about';
};
const TIMELINE = timelineJson as unknown as { available: boolean; source: string; entries: TimelineEntry[] };

/** 同一天的提交合成一组，日期只显示一次。 */
const groupByDate = (entries: TimelineEntry[]) => {
  const groups: { key: string; items: TimelineEntry[] }[] = [];
  for (const entry of entries) {
    const last = groups[groups.length - 1];
    if (last && last.key === entry.date) last.items.push(entry);
    else groups.push({ key: entry.date, items: [entry] });
  }
  return groups;
};

export const About = ({
  filter,
  groupBy,
  search,
  preset,
  phase,
}: {
  filter?: string;
  groupBy?: string;
  search?: string;
  preset?: string;
  phase?: string;
}) => {
  const mode: 'date' | 'milestone' = groupBy === 'milestone' ? 'milestone' : 'date';
  const [expanded, setExpanded] = useState<string[]>([]);
  const setMode = (next: 'date' | 'milestone') => {
    const params = new URLSearchParams();
    if (filter && filter !== 'all') params.set('type', filter);
    if (next === 'milestone') params.set('by', 'milestone');
    const query = params.toString();
    navigate(query ? `/about?${query}` : '/about');
  };

  const types = ['all', ...new Set(TIMELINE.entries.map((entry) => entry.type))];
  const requested = filter ?? 'all';
  const invalidType = requested !== 'all' && !types.includes(requested);
  const newestMilestone = TIMELINE.entries[0]?.milestone;
  const currentLabel = TIMELINE.source === 'tag' && newestMilestone && newestMilestone !== '未打标签' ? '当前' : '未发布';
  const active = invalidType ? 'all' : requested;
  const currentMilestone = TIMELINE.entries[0]?.milestone ?? '';
  const effectivePhase = phase === 'current' ? currentMilestone : phase;

  const [query, setQuery] = useState(search ?? '');
  const [bindCurrent, setBindCurrent] = useState(false);
  const [presets, setPresets] = useState<Preset[]>([]);
  useEffect(() => setPresets(readPresets()), []);

  // 预设切换会改 URL：搜索框跟着 URL 走，避免"应用了预设但旧关键词还在"
  useEffect(() => setQuery(search ?? ''), [search]);

  const hasFilters = active !== 'all' || mode === 'milestone' || query.trim().length > 0;

  const savePreset = () => {
    const label = [
      active === 'all' ? '全部' : (TYPE_LABEL[active] ?? active),
      mode === 'milestone' ? '按阶段' : '',
      query.trim() ? `“${query.trim()}”` : '',
    ]
      .filter(Boolean)
      .join(' · ');
    const next = [
      ...presets,
      {
        id: `preset-${Date.now()}`,
        label: bindCurrent ? `${label} · 跟随当前阶段` : label,
        type: active === 'all' ? undefined : active,
        by: mode === 'milestone' ? 'milestone' : undefined,
        q: query.trim() || undefined,
        phase: bindCurrent ? 'current' : undefined,
      },
    ];
    setPresets(next);
    writePresets(next);
  };

  // ?preset=id：解析成具体参数再落到 URL，方便把预设分享给没存过的人
  useEffect(() => {
    if (!preset) return;
    const found = [...BUILTIN_PRESETS, ...readPresets()].find((item) => item.id === preset);
    if (found) {
      window.history.replaceState(null, '', `#${presetHash(found)}`);
      setQuery(found.q ?? '');
    }
  }, [preset]);

  const applyPreset = (preset: Preset) => {
    setQuery(preset.q ?? '');
    navigate(presetHash(preset));
  };

  const toggleLock = (id: string) => {
    const next = presets.map((item) => (item.id === id ? { ...item, locked: !item.locked } : item));
    setPresets(next);
    writePresets(next);
  };

  const renamePreset = (id: string) => {
    const current = presets.find((item) => item.id === id);
    if (!current || current.locked) return;
    const label = window.prompt('预设名称', current.label)?.trim();
    if (!label) return;
    const next = presets.map((item) => (item.id === id ? { ...item, label } : item));
    setPresets(next);
    writePresets(next);
  };

  const movePreset = (id: string, direction: -1 | 1) => {
    const index = presets.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= presets.length) return;
    const next = [...presets];
    [next[index], next[target]] = [next[target], next[index]];
    setPresets(next);
    writePresets(next);
  };

  const removePreset = (id: string) => {
    if (presets.find((preset) => preset.id === id)?.locked) return;
    const next = presets.filter((preset) => preset.id !== id);
    setPresets(next);
    writePresets(next);
  };
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const entries = TIMELINE.entries.filter((entry) => {
    if (active !== 'all' && entry.type !== active) return false;
    if (effectivePhase && entry.milestone !== effectivePhase) return false;
    if (!terms.length) return true;
    const haystack = `${entry.subject} ${entry.hash} ${entry.milestone}`;
    return terms.every((term) => matchesTerm(haystack, term));
  });

  const syncUrl = (next: { type?: string; by?: 'milestone'; q?: string }) => {
    const params = new URLSearchParams();
    const type = next.type ?? (active === 'all' ? '' : active);
    const by = next.by ?? (mode === 'milestone' ? 'milestone' : '');
    const q = next.q ?? query.trim();
    if (type) params.set('type', type);
    if (by) params.set('by', by);
    if (q) params.set('q', q);
    const hash = params.toString() ? `#/about?${params.toString()}` : '#/about';
    window.history.replaceState(null, '', hash);
  };

  type Group = { key: string; date: string | null; current?: boolean; items: TimelineEntry[] };

  const searching = terms.length > 0;
  const ranked = [...entries].sort((a, b) => relevance(b, terms) - relevance(a, terms));

  const groups: Group[] = searching
    ? [{ key: `搜索结果 · ${ranked.length} 条（按相关度）`, date: null, items: ranked }]
    : mode === 'date'
      ? groupByDate(entries).map((group) => ({ ...group, date: null }))
      : entries
          .reduce<Group[]>((acc, entry) => {
            const last = acc[acc.length - 1];
            if (last && last.key === entry.milestone) last.items.push(entry);
            else acc.push({ key: entry.milestone, date: entry.milestoneDate, items: [entry] });
            return acc;
          }, [])
          // 最新的一段标成"未发布 / 当前"，和已发布的阶段区分开
          .map((group) => ({ ...group, current: group.key === TIMELINE.entries[0]?.milestone }));

  // 带 ?type= / ?by= 的分享链接直接落在时间线
  useEffect(() => {
    if (!filter && !groupBy) return;
    document.getElementById('timeline')?.scrollIntoView({ block: 'start' });
  }, [filter, groupBy]);

  const toggleGroup = (key: string) =>
    setExpanded((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));

  return (
  <div className="about">
    <header className="page-head">
      <p className="eyebrow">关于 · About</p>
      <h1 className="page-title">这套东西是干什么用的</h1>
      <p className="page-lede">
        一句话：把"设计决定"变成可编译、可校验、可交付的工程资产。
        它面向的是这样一类项目——一个人或小团队，要同时做 Web 与小程序，要支持多个品牌，还想让 AI 参与编码。
      </p>
    </header>

    <section className="about-section" id="why">
      <header className="home-head">
        <p className="eyebrow">为什么做</p>
        <h2 className="home-title">三个反复出现的问题</h2>
      </header>
      <div className="about-grid">
        {PROBLEMS.map((item, index) => (
          <article className="about-card" key={item.title}>
            <span className="about-index">{String(index + 1).padStart(2, '0')}</span>
            <h3 className="about-card-title">{item.title}</h3>
            <p className="about-problem">{item.body}</p>
            <p className="about-answer">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="about-section" id="delivers">
      <header className="home-head">
        <p className="eyebrow">交付什么</p>
        <h2 className="home-title">四样东西</h2>
      </header>
      <dl className="about-delivers">
        {DELIVERS.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
            <span>{item.note}</span>
          </div>
        ))}
      </dl>
    </section>

    <section className="about-section" id="not">
      <header className="home-head">
        <p className="eyebrow">边界</p>
        <h2 className="home-title">它不是什么</h2>
        <p className="home-note">把边界说清楚，比把能力说满更有用。</p>
      </header>
      <div className="about-grid about-grid-wide">
        {NOT.map((item) => (
          <article className="about-card" key={item.title}>
            <h3 className="about-card-title">{item.title}</h3>
            <p className="about-problem">{item.body}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="about-section" id="status">
      <header className="home-head">
        <p className="eyebrow">现在到哪了</p>
        <h2 className="home-title">一个 MVP，但有证据链</h2>
      </header>
      <div className="about-status">
        <dl>
          <div>
            <dt>产品</dt>
            <dd>{apps.length}</dd>
          </div>
          <div>
            <dt>排列</dt>
            <dd>{manifest.permutations}</dd>
          </div>
          <div>
            <dt>产物</dt>
            <dd>{manifest.artifacts.length}</dd>
          </div>
          <div>
            <dt>对比度</dt>
            <dd>{manifest.contrast.pairs}</dd>
          </div>
        </dl>
        <ul className="about-list">
          <li>7 个 ADR 记录取舍；决策页直接由 ADR 生成，不手写。</li>
          <li>16 个单测覆盖格式化与布局档位；6 张视觉基线锁住像素。</li>
          <li>提案与配方各有一组契约测试（1 通过 / 2 拦截、1 通过 / 1 拦截）。</li>
          <li>边界：还没有接真实小程序工程，真机截图脚本待接入。</li>
        </ul>
      </div>
    </section>

    <section className="about-section" id="timeline">
      <header className="home-head">
        <p className="eyebrow">怎么走到这里</p>
        <h2 className="home-title">一条从 token 到站点的线</h2>
        <p className="home-note">
          直接由 <code>git log</code> 生成，每次编译同步；每组默认显示 {VISIBLE_PER_GROUP} 条，其余可展开。
        </p>
        <div className="timeline-filter" role="group" aria-label="按提交类型筛选">
          {types.map((type) => (
            <button
              key={type}
              type="button"
              className="timeline-chip"
              data-active={active === type}
              onClick={() => {
                const params = new URLSearchParams();
                if (type !== 'all') params.set('type', type);
                if (mode === 'milestone') params.set('by', 'milestone');
                const query = params.toString();
                navigate(query ? `/about?${query}` : '/about');
              }}
            >
              {type === 'all' ? '全部' : (TYPE_LABEL[type] ?? type)}
              <span>{type === 'all' ? TIMELINE.entries.length : TIMELINE.entries.filter((entry) => entry.type === type).length}</span>
            </button>
          ))}
        </div>
        <div className="timeline-presets" role="group" aria-label="筛选预设">
          <span className="timeline-presets-label">预设</span>
          {[...BUILTIN_PRESETS, ...presets]
            .filter((preset) => !preset.type || types.includes(preset.type))
            .map((preset) => {
            const custom = !preset.id.startsWith('builtin-');
            return (
              <span className="timeline-preset" key={preset.id}>
                <button type="button" className="timeline-preset-apply" onClick={() => applyPreset(preset)}>
                  {preset.label}
                </button>
                {custom ? (
                  <span className="timeline-preset-tools">
                    <button type="button" aria-label={`上移 ${preset.label}`} onClick={() => movePreset(preset.id, -1)}>
                      ↑
                    </button>
                    <button type="button" aria-label={`下移 ${preset.label}`} onClick={() => movePreset(preset.id, 1)}>
                      ↓
                    </button>
                    <button type="button" aria-label={`${preset.locked ? '解锁' : '锁定'} ${preset.label}`} onClick={() => toggleLock(preset.id)}>
                      {preset.locked ? '🔒' : '🔓'}
                    </button>
                    {preset.locked ? null : (
                      <button type="button" aria-label={`重命名 ${preset.label}`} onClick={() => renamePreset(preset.id)}>
                        ✎
                      </button>
                    )}
                    {preset.locked ? null : (
                      <button type="button" aria-label={`删除预设 ${preset.label}`} onClick={() => removePreset(preset.id)}>
                        ×
                      </button>
                    )}
                  </span>
                ) : null}
              </span>
            );
          })}
          <button type="button" className="timeline-preset-save" onClick={savePreset} disabled={!hasFilters}>
            存为预设
          </button>
          <label className="timeline-bind">
            <input type="checkbox" checked={bindCurrent} onChange={(event) => setBindCurrent(event.target.checked)} />
            跟随当前阶段
          </label>
        </div>

        <label className="timeline-search">
          <span>搜索</span>
          <input
            type="search"
            value={query}
            placeholder="提交信息或 hash"
            onChange={(event) => {
              setQuery(event.target.value);
              syncUrl({ q: event.target.value });
            }}
          />
        </label>
        <div className="timeline-mode" role="group" aria-label="分组方式">
          <button type="button" className="timeline-mode-btn" data-active={mode === 'date'} onClick={() => setMode('date')}>
            按日期
          </button>
          <button type="button" className="timeline-mode-btn" data-active={mode === 'milestone'} onClick={() => setMode('milestone')}>
            按里程碑
          </button>
        </div>
      </header>
      {effectivePhase ? (
        <p className="timeline-hint">
          只显示阶段「{effectivePhase}」
          {phase === 'current' ? '（当前阶段，随提交自动前移）' : ''}
          <button type="button" className="timeline-more" onClick={() => navigate('/about')}>
            清除阶段筛选
          </button>
        </p>
      ) : null}
      {preset && ![...BUILTIN_PRESETS, ...presets].some((item) => item.id === preset) ? (
        <p className="timeline-hint">
          链接里的预设「{preset}」在这台设备上没有保存过，已显示全部提交。
        </p>
      ) : null}
      {invalidType ? (
        <p className="timeline-hint">链接里的类型「{requested}」不存在，已显示全部提交。</p>
      ) : null}
      {mode === 'milestone' && TIMELINE.source === 'builtin' ? (
        <p className="timeline-hint">仓库里还没有 git tag，先按内置阶段分组；打标签后会自动切换成标签阶段。</p>
      ) : null}
      {entries.length === 0 ? (
        <p className="timeline-hint">
          这个类型下没有提交。
          <button type="button" className="timeline-more" onClick={() => navigate('/about')}>
            回到全部
          </button>
        </p>
      ) : null}
      <ol className="timeline">
        {groups.map((group) => {
          const open = expanded.includes(group.key);
          const visible = open ? group.items : group.items.slice(0, VISIBLE_PER_GROUP);
          const rest = group.items.length - visible.length;
          return (
            <li className="timeline-item" key={group.key} data-current={'current' in group && group.current ? 'true' : undefined}>
              <span className="timeline-when">
                {group.key}
                {mode === 'milestone' && group.date ? <small>{group.date}</small> : null}
                {'current' in group && group.current ? <span className="timeline-current">{currentLabel}</span> : null}
              </span>
              <ul className="timeline-body">
                {visible.map((entry) => (
                  <li key={entry.hash}>
                    <span className="timeline-subject">
                      {entry.type !== 'feat' ? <span className="timeline-type">{TYPE_LABEL[entry.type] ?? entry.type}</span> : null}
                      {highlight(entry.subject, terms)}
                    </span>
                    <code className="timeline-hash">{entry.hash}</code>
                  </li>
                ))}
                {rest > 0 || open ? (
                  <li className="timeline-more-row">
                    <button type="button" className="timeline-more" onClick={() => toggleGroup(group.key)}>
                      {open ? '收起' : `展开剩余 ${rest} 条`}
                    </button>
                  </li>
                ) : null}
              </ul>
            </li>
          );
        })}
      </ol>
    </section>

    <section className="about-section" id="who">
      <header className="home-head">
        <p className="eyebrow">谁做的 · Studio</p>
        <h2 className="home-title">Alro&apos;s studio</h2>
        <p className="home-note">设计工程 · 前端实现 · 设计系统</p>
      </header>
      <div className="about-who">
        <p>
          一个独立工作室，做设计工程与前端实现。这套管线来自自己的项目需求：一个人要同时维护 Web 与小程序、
          多套品牌、还要让 AI 参与交付，所以把"一致性"从人的记忆里搬进了编译器和门禁。
        </p>
        <p className="about-stack-line">
          技术底座：
          {STACK.map((item) => (
            <span className="about-tag" key={item}>
              {item}
            </span>
          ))}
        </p>
        <p className="about-sign-note">
          示例里的每一屏都直接吃编译出来的 token；这层黑色外壳是站点自己的界面样式，不参与产品的排列，
          这样对照才看得清哪一层来自系统、哪一层只是包装。
        </p>
        <p className="about-links">
          <Button onClick={() => navigate('/method')}>看完整方法 →</Button>
          <Button variant="ghost" onClick={() => navigate('/')}>
            回到首页看示例
          </Button>
        </p>
        <p className="about-sign-links">
          <a href="https://github.com/liquiid727/my-ant-design" target="_blank" rel="noreferrer">
            GitHub 仓库
          </a>
          <a href="https://github.com/liquiid727/my-ant-design/issues" target="_blank" rel="noreferrer">
            合作与咨询：开 issue
          </a>
        </p>
      </div>
    </section>

  </div>
  );
};
