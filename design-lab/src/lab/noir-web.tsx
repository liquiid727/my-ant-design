import { Action, Badge, MetricValue, ProgressRing } from '../components/ui';
import { manifest } from './model';

const LAYERS = [
  { label: '语义层', value: 96 },
  { label: '品牌层', value: 88 },
  { label: '组件层', value: 82 },
];

const ARTIFACTS = [
  { name: 'tokens.css', kind: 'Web · CSS 变量', size: '88.2 KB' },
  { name: 'tokens.wxss', kind: '小程序 · WXSS', size: '51.6 KB' },
  { name: 'catalog.json', kind: '实验台 · Token 目录', size: '372.4 KB' },
  { name: 'qa.json', kind: '门禁 · 对比度报告', size: '17.3 KB' },
];

const RELEASES = [
  { version: '3.2', name: 'Noir', date: '2025-11-05', note: '暗黑品牌包 · 桌面 Web 控制台' },
  { version: '3.1', name: 'Contrast', date: '2025-10-28', note: '全部对比度配对通过' },
  { version: '3.0', name: 'Tokens', date: '2025-10-17', note: '三层语义 · 公开 token 收敛' },
];

/**
 * Noir 自己的 Web 示例：一个设计系统控制台，不是任何移动端案例的桌面版。
 * 页面只用 semantic / component token，不读 route / transaction 等产品语义。
 */
export const NoirWeb = () => (
  <div className="web-page web-console">
    <aside className="web-side">
      <div className="web-brand">
        <span className="web-brand-mark" aria-hidden="true">
          N
        </span>
        <span>Noir</span>
      </div>

      <nav className="web-nav" aria-label="主导航">
        <span className="web-nav-item" data-active="true">概览</span>
        <span className="web-nav-item">Token</span>
        <span className="web-nav-item">组件</span>
        <span className="web-nav-item">发布</span>
        <span className="web-nav-item">设置</span>
      </nav>

      <div>
        <p className="web-side-label">环境</p>
        <div className="web-side-stats">
          <div>
            <strong>{manifest.permutations}</strong>
            <span>套排列</span>
          </div>
          <div>
            <strong>0</strong>
            <span>门禁失败</span>
          </div>
        </div>
      </div>

      <div className="web-user">
        <span className="web-avatar" aria-hidden="true" />
        <div>
          <strong>Alro</strong>
          <small>Design engineering</small>
        </div>
      </div>
    </aside>

    <main className="web-main">
      <header className="web-top">
        <div>
          <p className="web-eyebrow">Design system · 2025</p>
          <h1 className="web-title">系统概览</h1>
        </div>
        <div className="web-top-actions">
          <span className="web-search">搜索 token、组件、发布…</span>
          <Action label="查看发布" />
        </div>
      </header>

      <section className="web-hero">
        <article className="web-panel">
          <div className="web-panel-head">
            <p className="web-eyebrow">Token 覆盖率</p>
            <span className="web-delta">+4.2% 本周</span>
          </div>
          <p className="web-metric">
            92<span>%</span>
          </p>
          <p className="web-sub">公开 token 已被页面或组件引用，剩余的是预留位。</p>

          <div className="web-bars">
            {LAYERS.map((layer) => (
              <div className="web-bar-row" key={layer.label}>
                <span>{layer.label}</span>
                <div className="web-bar">
                  <i style={{ width: `${layer.value}%` }} />
                </div>
                <strong>{layer.value}%</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="web-panel web-goal">
          <p className="web-eyebrow">对比度</p>
          <ProgressRing value={1} size="lg" label={<MetricValue kind="percent" value={1} label="全部通过" />} />
          <div className="web-stats">
            <div>
              <strong>{manifest.contrast.pairs}</strong>
              <span>组配对</span>
            </div>
            <div>
              <strong>{manifest.permutations}</strong>
              <span>套排列</span>
            </div>
            <div>
              <strong>0</strong>
              <span>不达标</span>
            </div>
          </div>
        </article>
      </section>

      <section className="web-columns">
        <article className="web-panel">
          <div className="web-panel-head">
            <h2 className="web-h2">最近编译</h2>
            <span className="web-link">查看产物 →</span>
          </div>
          <div className="web-token-rows">
            {ARTIFACTS.map((item) => (
              <div className="web-token-row" key={item.name}>
                <code>{item.name}</code>
                <span>{item.kind}</span>
                <strong>{item.size}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="web-panel">
          <div className="web-panel-head">
            <h2 className="web-h2">发布记录</h2>
            <span className="web-link">全部发布 →</span>
          </div>
          <div className="web-release-head">
            <Badge unlocked label={`v${RELEASES[0].version} · ${RELEASES[0].name}`} />
            <span className="web-link">{RELEASES[0].date}</span>
          </div>
          <p className="web-sub">{RELEASES[0].note}</p>

          <div className="web-release-list">
            {RELEASES.slice(1).map((item) => (
              <div className="web-release-row" key={item.version}>
                <code>v{item.version}</code>
                <span>{item.name}</span>
                <small>{item.date}</small>
              </div>
            ))}
          </div>
          <p className="web-sub">每次编译都会重跑 7 道门禁；失败不会进入发布记录。</p>
        </article>
      </section>
    </main>
  </div>
);
