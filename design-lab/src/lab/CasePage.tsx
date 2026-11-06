import adrIndexJson from '../generated/adr-index.json';
import { screensOf } from '../apps';
import { PhoneFrame } from '../components/ui';
import { navigate } from '../lib/router';
import { AuditPanel } from './AuditPanel';
import { MotionBench } from './MotionBench';
import { PermutationGrid } from './PermutationGrid';
import { RealityView } from './RealityView';
import { TokenTable } from './TokenTable';
import { appById, appLabel, brandsOf, manifest, type ThemeName } from './model';

const TABS = [
  { id: 'overview', label: '概览' },
  { id: 'reality', label: '现实界面' },
  { id: 'motion', label: '动效' },
  { id: 'audit', label: '审计' },
  { id: 'tokens', label: 'Token 表' },
  { id: 'decisions', label: '设计决策' },
] as const;

type Adr = { id: string; title: string; status: string; problem: string; decision: string; file: string };
const ADRS = adrIndexJson as unknown as Adr[];

/** 这些决策直接解释了这个案例的做法；其余的是全局决策。 */
const RELEVANT: Record<string, string[]> = {
  ride: ['ADR-0001', 'ADR-0002', 'ADR-0003', 'ADR-0006', 'ADR-0007'],
  ledger: ['ADR-0004', 'ADR-0005', 'ADR-0007'],
};

type TabId = (typeof TABS)[number]['id'];

const PanelHead = ({ title, note }: { title: string; note: string }) => (
  <div className="panel-head">
    <h2 className="panel-title">{title}</h2>
    <p className="panel-note">{note}</p>
  </div>
);

export const CasePage = ({
  app,
  brand,
  theme,
  tab: tabParam,
  onBrand,
  onTheme,
}: {
  app: string;
  brand: string;
  theme: ThemeName;
  tab?: string;
  onBrand: (brandId: string) => void;
  onTheme: (theme: ThemeName) => void;
}) => {
  const tab: TabId = TABS.some((item) => item.id === tabParam) ? (tabParam as TabId) : 'overview';
  const selectTab = (next: TabId) => navigate(`/case/${app}/${next}`);
  const screens = screensOf(app);
  const appInfo = appById(app);
  const stat = manifest.apps.find((item) => item.id === app) ?? manifest.apps[0];

  return (
    <div className="case">
      <header className="case-head">
        <button type="button" className="case-back" onClick={() => navigate('/')}>
          ← 全部案例
        </button>

        <div className="case-head-row">
          <div className="case-head-main">
            <p className="eyebrow">产品案例 · {theme === 'light' ? '浅色' : '深色'}</p>
            <h1 className="case-head-title">{appInfo.appLatin}</h1>
            <p className="case-head-meta">
              {screens.length} 屏 · {stat.tokens.public} 个公开 token · {brandsOf(app).length} 品牌 × 2 主题
            </p>
          </div>

          <div className="case-controls">
          <div className="segmented" role="group" aria-label="品牌">
            {brandsOf(app).map((item) => (
              <button key={item.id} type="button" className="segmented-item" data-active={brand === item.id} onClick={() => onBrand(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
            <div className="segmented" role="group" aria-label="主题">
              {(['light', 'dark'] as ThemeName[]).map((item) => (
                <button key={item} type="button" className="segmented-item" data-active={theme === item} onClick={() => onTheme(item)}>
                  {item === 'light' ? '浅色' : '深色'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <nav className="case-tabs" aria-label="案例视图">
        {TABS.map((item) => (
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
              title="排列矩阵"
              note="产品 × 品牌 × 主题。品牌只换视觉身份，产品只换业务语义，两边都不复制组件。"
            />
            <PermutationGrid app={app} activeBrand={brand} activeTheme={theme} onPick={(nextBrand, nextTheme) => {
              onBrand(nextBrand);
              onTheme(nextTheme);
            }} />

            <PanelHead
              title={`${appLabel(app)}实例`}
              note={`${screens.length} 屏全部由 token 与组件契约拼出来，没有一行硬编码颜色。`}
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

        {tab === 'reality' ? (
          <>
            <PanelHead
              title="现实界面"
              note="八种机型、真实视口。每台可以单独切横竖屏、开关安全区，右侧标签是它落入的布局档位。"
            />
            <RealityView app={app} brand={brand} theme={theme} />
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
            <PanelHead title="审计" note="对比度在 token 层判定：15 组配对 × 4 套排列，有任何一条不达标就阻断合并。" />
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
                .sort((a, b) => Number(RELEVANT[app]?.includes(b.id)) - Number(RELEVANT[app]?.includes(a.id)))
                .map((adr) => (
                <article className="decision" key={adr.id} data-relevant={RELEVANT[app]?.includes(adr.id) ?? false}>
                  <p className="decision-meta">
                    <span className="decision-id">{adr.id}</span>
                    <span className="decision-status">{adr.status}</span>
                    {RELEVANT[app]?.includes(adr.id) ? <span className="decision-related">与本案相关</span> : null}
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
            <TokenTable app={app} brand={brand} theme={theme} />
          </>
        ) : null}
      </div>
    </div>
  );
};
