import { useEffect, useState } from 'react';
import { screensOf } from './apps';
import { PhoneFrame } from './components/ui';
import { AuditPanel } from './lab/AuditPanel';
import { CompileBand } from './lab/CompileBand';
import { MotionBench } from './lab/MotionBench';
import { PermutationGrid } from './lab/PermutationGrid';
import { RealityView } from './lab/RealityView';
import { Section, Tag } from './lab/Section';
import { TokenTable } from './lab/TokenTable';
import { appLabel, apps, brandById, brandsOf, manifest, type ThemeName } from './lab/model';

const NAV = [
  { id: 'matrix', index: '01', label: '排列矩阵' },
  { id: 'instance', index: '02', label: '实例' },
  { id: 'reality', index: '03', label: '现实界面' },
  { id: 'motion', index: '04', label: '动效' },
  { id: 'audit', index: '05', label: '审计' },
  { id: 'tokens', index: '06', label: 'Token 表' },
];

const initialTheme = (): ThemeName =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export default function App() {
  const [theme, setTheme] = useState<ThemeName>(initialTheme);
  const [app, setApp] = useState(apps[0].id);
  const [brand, setBrand] = useState(brandsOf(apps[0].id)[0].id);

  const brandInfo = brandById(app, brand);
  const screens = screensOf(app);
  const appStat = manifest.apps.find((item) => item.id === app) ?? manifest.apps[0];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.app = app;
    document.documentElement.dataset.brand = brand;
  }, [theme, app, brand]);

  const pickApp = (nextApp: string) => {
    setApp(nextApp);
    const brands = brandsOf(nextApp);
    if (!brands.some((item) => item.id === brand)) setBrand(brands[0].id);
  };

  return (
    <div className="shell">
      <aside className="rail">
        <div className="rail-brand">
          <p className="eyebrow">Design Lab</p>
          <p className="rail-title">
            Token
            <br />
            编译车间
          </p>
          <p className="rail-note">
            产品 × 品牌 × 主题，
            <br />
            三个维度各自独立。
          </p>
        </div>

        <nav className="rail-nav" aria-label="章节">
          {NAV.map((item) => (
            <a className="rail-link" key={item.id} href={`#${item.id}`}>
              <span className="rail-index">{item.index}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="rail-foot">
          <p className="eyebrow">产品</p>
          <div className="segmented" role="group" aria-label="产品">
            {apps.map((item) => (
              <button key={item.id} type="button" className="segmented-item" data-active={app === item.id} onClick={() => pickApp(item.id)}>
                {item.label}
              </button>
            ))}
          </div>

          <p className="eyebrow">品牌</p>
          <div className="segmented" role="group" aria-label="品牌">
            {brandsOf(app).map((item) => (
              <button key={item.id} type="button" className="segmented-item" data-active={brand === item.id} onClick={() => setBrand(item.id)}>
                {item.label}
              </button>
            ))}
          </div>

          <p className="eyebrow">主题</p>
          <div className="segmented" role="group" aria-label="主题">
            {(['light', 'dark'] as ThemeName[]).map((item) => (
              <button key={item} type="button" className="segmented-item" data-active={theme === item} onClick={() => setTheme(item)}>
                {item === 'light' ? '浅色' : '深色'}
              </button>
            ))}
          </div>

          <dl className="rail-stats">
            <div>
              <dt>token</dt>
              <dd>{appStat.tokens.total}</dd>
            </div>
            <div>
              <dt>排列</dt>
              <dd>{manifest.permutations}</dd>
            </div>
            <div>
              <dt>配对</dt>
              <dd>{manifest.contrast.pairs}</dd>
            </div>
          </dl>
        </div>
      </aside>

      <main className="canvas">
        <header className="masthead">
          <p className="eyebrow">Token-first design engineering</p>
          <h1 className="masthead-title">
            从一份 Token，
            <br />
            生成四个平台的产物
          </h1>
          <p className="masthead-lede">
            源文件只有 JSON。编译器负责解析、换算、分级、体检，把同一份语义输出成 Web 的 CSS 变量、小程序的 WXSS、TypeScript
            类型，以及给 AI 读的设计上下文。产品决定内容，品牌决定长相，主题只补差值。
          </p>
          <CompileBand app={app} />
        </header>

        <Section
          id="matrix"
          index="01"
          title="排列矩阵"
          note="排列 = 产品 × 品牌 × 主题"
          aside={<Tag tone="accent">{manifest.permutations} 套排列</Tag>}
        >
          <p className="section-lede">
            当前产品是 <strong>{appLabel(app)}</strong>：切换品牌只换视觉身份，切换产品只换业务语义。两边都不需要复制组件或页面。
          </p>
          <PermutationGrid
            app={app}
            activeBrand={brand}
            activeTheme={theme}
            onPick={(nextBrand, nextTheme) => {
              setBrand(nextBrand);
              setTheme(nextTheme);
            }}
          />
        </Section>

        <Section
          id="instance"
          index="02"
          title={`${appLabel(app)}实例`}
          note="竖直切片：一条真实链路"
          aside={<Tag>{screens.length} 屏 · 不依赖真实 API</Tag>}
        >
          <p className="section-lede">
            这些屏幕全部由 token 和组件契约拼出来，没有一行硬编码颜色。现在用的是 <strong>{brandInfo.label} · {brandInfo.latin}</strong>{' '}
            品牌包：结构不变，长相全变——这是“通用”的可执行判据。
          </p>
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
        </Section>

        <Section id="reality" index="03" title="现实界面" note="同一屏，八种机型" aside={<Tag>竖屏 · 横屏 · 安全区</Tag>}>
          <p className="section-lede">
            HTML 直接按真实视口尺寸渲染：宽度、留白、断行按设备计算，只有外层容器缩放。每台机型可以单独切横竖屏、开关安全区，
            并显示它落在哪个布局档位——小屏、横屏手机、平板三种状态可以直接对比。
          </p>
          <RealityView app={app} brand={brand} theme={theme} />
        </Section>

        <Section id="motion" index="04" title="动效" note="Motion Tokens 是可回放的" aside={<Tag>5 组</Tag>}>
          <MotionBench app={app} brand={brand} />
        </Section>

        <Section
          id="audit"
          index="05"
          title="审计"
          note="对比度在 token 层判定"
          aside={<Tag tone={manifest.contrast.failing ? 'warn' : 'accent'}>{manifest.contrast.failing ? '有失败项' : '全部通过'}</Tag>}
        >
          <AuditPanel app={app} brand={brand} />
        </Section>

        <Section id="tokens" index="06" title="Token 表" note="谁都能查，谁都不能改" aside={<Tag>{brandInfo.counts.public} 个业务可见</Tag>}>
          <TokenTable app={app} brand={brand} theme={theme} />
        </Section>

        <footer className="foot">
          <p className="foot-line">
            {appLabel(app)} · {brandInfo.label} · {appStat.tokens.total} 个 token · {manifest.permutations} 套排列 · {appStat.darkOverrides} 个深色覆盖
          </p>
          <p className="foot-note">下一步：页面级 recipe schema，把“生成闭环”也变成可校验的契约。</p>
        </footer>
      </main>
    </div>
  );
}
