import adrIndexJson from '../generated/adr-index.json';
import { screensOf } from '../apps';
import { PhoneFrame } from '../components/ui';
import { navigate } from '../lib/router';
import { AuditPanel } from './AuditPanel';
import { MotionBench } from './MotionBench';
import { RealityView } from './RealityView';
import { TokenTable } from './TokenTable';
import { WebPreview } from './WebPreview';
import { exampleById } from './examples';
import { brandById, manifest, qaFor } from './model';

const MOBILE_TABS = [
  { id: 'overview', label: '概览' },
  { id: 'reality', label: '现实界面' },
  { id: 'motion', label: '动效' },
  { id: 'audit', label: '审计' },
  { id: 'tokens', label: 'Token 表' },
  { id: 'decisions', label: '设计决策' },
] as const;

const WEB_TABS = [
  { id: 'web', label: 'Web 界面' },
  { id: 'motion', label: '动效' },
  { id: 'audit', label: '审计' },
  { id: 'tokens', label: 'Token 表' },
  { id: 'decisions', label: '设计决策' },
] as const;

type TabId = 'overview' | 'web' | 'reality' | 'motion' | 'audit' | 'tokens' | 'decisions';

type Adr = { id: string; title: string; status: string; problem: string; decision: string; file: string };
const ADRS = adrIndexJson as unknown as Adr[];

/** 这些决策直接解释了这个示例的做法；其余的是全局决策。 */
const RELEVANT: Record<string, string[]> = {
  ride: ['ADR-0001', 'ADR-0002', 'ADR-0003', 'ADR-0006', 'ADR-0007'],
  ledger: ['ADR-0004', 'ADR-0005', 'ADR-0007'],
};

const PanelHead = ({ title, note }: { title: string; note: string }) => (
  <div className="panel-head">
    <h2 className="panel-title">{title}</h2>
    <p className="panel-note">{note}</p>
  </div>
);

/** 一个示例 = 一种固定身份（产品 × 品牌 × 主题 × 媒介）。 */
export const CasePage = ({ exampleId, tab: tabParam, width }: { exampleId: string; tab?: string; width?: number }) => {
  const example = exampleById(exampleId);
  const { app, brand, theme, medium } = example;
  const tabs = medium === 'web' ? WEB_TABS : MOBILE_TABS;
  const fallback: TabId = medium === 'web' ? 'web' : 'overview';
  const tab: TabId = tabs.some((item) => item.id === tabParam) ? (tabParam as TabId) : fallback;
  const selectTab = (next: TabId) => navigate(`/case/${example.id}/${next}`);

  const screens = screensOf(app);
  const brandInfo = brandById(app, brand);
  const stat = manifest.apps.find((item) => item.id === app) ?? manifest.apps[0];
  const pairsPerBrand = qaFor(app).results[`${brand}.light`]?.length ?? 15;
  const themeLabel = theme === 'light' ? '浅色' : '深色';
  const mediumLabel = medium === 'web' ? 'Web' : '移动端';
  // Web 示例只讲品牌与系统，不把某个产品的决策算成“与本案相关”。
  const relevant = medium === 'web' ? [] : RELEVANT[app] ?? [];
  const publicCount = medium === 'web' ? stat.tokens.public - (stat.tokens.byLayer.product ?? 0) : stat.tokens.public;

  return (
    <div className="case" data-app={app} data-brand={brand} data-theme={theme}>
      <header className="case-head">
        <button type="button" className="case-back" onClick={() => navigate('/')}>
          ← 全部示例
        </button>

        <div className="case-head-row">
          <div className="case-head-main">
            <p className="eyebrow">示例 · {mediumLabel}</p>
            <h1 className="case-head-title">{example.title}</h1>
            <p className="case-head-meta">
              {medium === 'web' ? 'Web · 1160' : `${screens.length} 屏`} ·{' '}
              {medium === 'web' ? `${publicCount} 个系统 token` : `${publicCount} 个公开 token`} · {brandInfo.label} · {themeLabel}
            </p>
          </div>

          <div className="case-head-actions">
            <button type="button" className="case-matrix-link" onClick={() => navigate(`/matrix?app=${app}&brand=${brand}&theme=${theme}`)}>
              全部排列 →
            </button>
          </div>
        </div>
      </header>

      <nav className="case-tabs" aria-label="示例视图">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className="case-tab"
            data-active={tab === item.id}
            onClick={() => selectTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="case-panel">
        {tab === 'overview' ? (
          <div className="overview">
            <PanelHead
              title={`${example.title} · 移动端`}
              note={`只展示 ${brandInfo.label} 品牌与${themeLabel}主题；${screens.length} 屏全部由 token 与组件契约拼出来，没有一行硬编码颜色。想看其它品牌或主题，去「全部排列」。`}
            />
            <div className="screens" data-count={screens.length}>
              {screens.map((screen) => {
                const Screen = screen.component;
                return (
                  <PhoneFrame key={screen.id} title={screen.label}>
                    <Screen />
                  </PhoneFrame>
                );
              })}
            </div>
          </div>
        ) : null}

        {tab === 'web' ? (
          <>
            <PanelHead
              title={`${example.title} · Web`}
              note={`Noir 的系统控制台：侧栏、Token 覆盖率、对比度与发布记录，全部由 Noir 品牌包渲染。当前固定 ${brandInfo.label} · ${themeLabel}。`}
            />
            <WebPreview app={app} brand={brand} theme={theme} />
          </>
        ) : null}

        {tab === 'reality' ? (
          <>
            <PanelHead
              title="现实界面"
              note={`八种机型、真实视口；当前固定 ${brandInfo.label} · ${themeLabel}。每台可以单独切横竖屏、开关安全区。`}
            />
            <RealityView app={app} brand={brand} theme={theme} width={width} />
          </>
        ) : null}

        {tab === 'motion' ? (
          <>
            <PanelHead title="动效" note="每一行的时长与缓动都直接读 motion token，点任意一行回放。" />
            <MotionBench app={app} brand={brand} />
          </>
        ) : null}

        {tab === 'audit' ? (
          <>
            <PanelHead
              title="审计"
              note={`对比度在 token 层判定：${pairsPerBrand} 组配对，浅色与深色各跑一遍；有任何一条不达标就阻断合并。`}
            />
            <AuditPanel app={app} brand={brand} />
          </>
        ) : null}

        {tab === 'decisions' ? (
          <>
            <PanelHead
              title="设计决策"
              note="七个取舍，直接从 docs/adr 摘出来——页面上看到的每一句话，原文都在仓库里。"
            />
            <div className="decisions">
              {[...ADRS]
                .sort((a, b) => Number(relevant.includes(b.id)) - Number(relevant.includes(a.id)))
                .map((adr) => (
                  <article className="decision" key={adr.id} data-relevant={relevant.includes(adr.id)}>
                    <p className="decision-meta">
                      <span className="decision-id">{adr.id}</span>
                      <span className="decision-status">{adr.status}</span>
                      {relevant.includes(adr.id) ? <span className="decision-related">与本案相关</span> : null}
                    </p>
                    <h3 className="decision-title">{adr.title}</h3>
                    <p className="decision-problem">{adr.problem}</p>
                    <p className="decision-call">
                      <span className="decision-label">决定</span>
                      {adr.decision}
                    </p>
                  </article>
                ))}
            </div>
          </>
        ) : null}

        {tab === 'tokens' ? (
          <>
            <PanelHead title="Token 表" note="谁都能查，谁都不能改：改值只能改 JSON，再由编译器产出。" />
            <TokenTable app={app} brand={brand} theme={theme} excludeProduct={medium === 'web'} />
          </>
        ) : null}
      </div>
    </div>
  );
};
