import { Action, Badge, MetricValue, ProgressRing } from '../../components/ui';
import { RouteCard } from './components';

export const HomeScreen = () => (
  <div className="screen">
    <header className="screen-head">
      <div className="screen-ident">
        <span className="avatar" aria-hidden="true" />
        <div>
          <p className="screen-eyebrow">周六 · 晴 21°</p>
          <h2 className="screen-greeting">早上好，Maya</h2>
        </div>
      </div>
      <span className="screen-glyph" aria-hidden="true">
        ⌕
      </span>
    </header>

    <p className="screen-eyebrow">为今天留了一条</p>
    <RouteCard title="西湖西溪绿道" distanceKm={23.4} elevationM={218} durationMin={95} surface="mixed" />

    <p className="screen-eyebrow">你上周骑过</p>
    <div className="screen-list" data-cols="2">
      <RouteCard title="龙井茶山环线" distanceKm={12.8} surface="road" layout="row" />
      <RouteCard title="钱塘江堤晨骑" distanceKm={31.2} surface="gravel" layout="row" />
    </div>

    <nav className="screen-nav" aria-label="主导航">
      <span data-active="true">发现</span>
      <span>路线</span>
      <span>骑行</span>
      <span>成就</span>
    </nav>
  </div>
);

export const RideEndScreen = () => (
  <div className="screen">
    <header className="screen-head screen-head-tight">
      <p className="screen-eyebrow">14:26 · 骑行结束</p>
      <h2 className="screen-title">今天比上周多骑了 8 公里</h2>
    </header>

    <div className="screen-ring">
      <ProgressRing value={0.78} size="lg" label={<MetricValue kind="distance" value={23.4} label="完成目标 78%" />} />
    </div>

    <div className="metric-row">
      <MetricValue kind="elevation" value={218} label="累计爬升" tone="muted" />
      <MetricValue kind="speed" value={18.6} label="平均速度" tone="muted" />
      <MetricValue kind="duration" value={95} label="骑行时长" tone="muted" />
    </div>

    <Badge unlocked label="山谷征服者 · 第一次骑满 200m 爬升" />

    <div className="screen-actions">
      <Action label="生成骑行明信片" />
      <Action label="就这样，收工" variant="ghost" />
    </div>
  </div>
);

export const PostcardScreen = () => (
  <div className="screen">
    <header className="screen-head screen-head-tight">
      <p className="screen-eyebrow">明信片 · 第 12 张</p>
      <h2 className="screen-title">把风留在纸上</h2>
    </header>

    <article className="postcard">
      <div className="postcard-stamp" aria-hidden="true">
        <span>西溪</span>
        <span>23.4</span>
      </div>
      <svg className="postcard-scene" viewBox="0 0 280 120" preserveAspectRatio="none" aria-hidden="true">
        <circle className="postcard-sun" cx="212" cy="34" r="16" />
        <path className="postcard-hill-back" d="M0 92 C 46 52, 86 74, 124 66 S 196 34, 280 70 L280 120 L0 120 Z" />
        <path className="postcard-hill-front" d="M0 108 C 54 82, 96 104, 146 96 S 232 74, 280 96 L280 120 L0 120 Z" />
        <path className="postcard-route" d="M14 104 C 52 92, 74 72, 110 78 S 176 96, 214 74 S 252 62, 268 64" />
      </svg>
      <div className="postcard-body">
        <p className="postcard-line">今天从文一西路一直骑到西溪深处，风是绿的。</p>
        <p className="postcard-sign">Maya · 2025.10.12</p>
      </div>
    </article>

    <div className="postcard-stats">
      <MetricValue kind="distance" value={23.4} label="轨迹长度" tone="muted" />
      <MetricValue kind="elevation" value={218} label="爬升" tone="muted" />
      <MetricValue kind="count" value={2} label="经过村落" tone="muted" unit="个" />
    </div>

    <div className="screen-actions">
      <Action label="分享到微信" />
      <Action label="再骑一次" variant="secondary" />
    </div>
  </div>
);
