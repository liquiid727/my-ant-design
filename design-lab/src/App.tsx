import { useEffect, useState } from 'react';
import { HomeScreen, PostcardScreen, RideEndScreen } from './cycling/screens';
import { PhoneFrame } from './components/ui';
import { AuditPanel } from './lab/AuditPanel';
import { CompileBand } from './lab/CompileBand';
import { MotionBench } from './lab/MotionBench';
import { PermutationGrid } from './lab/PermutationGrid';
import { Section, Tag } from './lab/Section';
import { TokenTable } from './lab/TokenTable';
import { brandById, brands, manifest, type ThemeName } from './lab/model';

const NAV = [
  { id: 'matrix', index: '01', label: '排列矩阵' },
  { id: 'instance', index: '02', label: '骑行实例' },
  { id: 'motion', index: '03', label: '动效' },
  { id: 'audit', index: '04', label: '审计' },
  { id: 'tokens', index: '05', label: 'Token 表' },
];

const initialTheme = (): ThemeName =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export default function App() {
  const [theme, setTheme] = useState<ThemeName>(initialTheme);
  const [brandId, setBrandId] = useState(brands[0].id);
  const brand = brandById(brandId);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.brand = brandId;
  }, [theme, brandId]);

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
            骑行只是参考实例。
            <br />
            管线本身与品牌无关。
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
          <p className="eyebrow">预览排列</p>
          <div className="segmented" role="group" aria-label="品牌">
            {brands.map((item) => (
              <button
                key={item.id}
                type="button"
                className="segmented-item"
                data-active={brandId === item.id}
                onClick={() => setBrandId(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="segmented" role="group" aria-label="主题">
            {(['light', 'dark'] as ThemeName[]).map((item) => (
              <button
                key={item}
                type="button"
                className="segmented-item"
                data-active={theme === item}
                onClick={() => setTheme(item)}
              >
                {item === 'light' ? '浅色' : '深色'}
              </button>
            ))}
          </div>
          <dl className="rail-stats">
            <div>
              <dt>token</dt>
              <dd>{brand.tokens.length}</dd>
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
            类型，以及给 AI 读的设计上下文。同一个骑行界面，换一个品牌包就换一套长相。
          </p>
          <CompileBand />
        </header>

        <Section
          id="matrix"
          index="01"
          title="排列矩阵"
          note="排列 = 品牌 × 主题"
          aside={<Tag tone="accent">{manifest.permutations} 套排列</Tag>}
        >
          <p className="section-lede">
            两个品牌包共用同一套 core、同一套组件、同一套产品语义，只在白名单范围内换色、换字、换圆角与缓动。点任意一张卡片，下面的实例、动效、审计和 Token 表会一起切换。
          </p>
          <PermutationGrid
            activeBrand={brandId}
            activeTheme={theme}
            onPick={(nextBrand, nextTheme) => {
              setBrandId(nextBrand);
              setTheme(nextTheme);
            }}
          />
        </Section>

        <Section id="instance" index="02" title="骑行实例" note="竖直切片：一条真实链路" aside={<Tag>3 屏 · 不依赖真实 API</Tag>}>
          <p className="section-lede">
            这三屏全部由 token 和组件契约拼出来，没有一行硬编码颜色。现在用的是 <strong>{brand.label} · {brand.latin}</strong>{' '}
            品牌包：结构不变，长相全变——这是“通用”的可执行判据。
          </p>
          <div className="screens">
            <PhoneFrame title="发现">
              <HomeScreen />
            </PhoneFrame>
            <PhoneFrame title="骑行结束">
              <RideEndScreen />
            </PhoneFrame>
            <PhoneFrame title="明信片">
              <PostcardScreen />
            </PhoneFrame>
          </div>
        </Section>

        <Section id="motion" index="03" title="动效" note="Motion Tokens 是可回放的" aside={<Tag>5 组</Tag>}>
          <MotionBench brand={brandId} />
        </Section>

        <Section
          id="audit"
          index="04"
          title="审计"
          note="对比度在 token 层判定"
          aside={<Tag tone={manifest.contrast.failing ? 'warn' : 'accent'}>{manifest.contrast.failing ? '有失败项' : '全部通过'}</Tag>}
        >
          <AuditPanel brand={brandId} />
        </Section>

        <Section id="tokens" index="05" title="Token 表" note="谁都能查，谁都不能改" aside={<Tag>{brand.counts.public} 个业务可见</Tag>}>
          <TokenTable brand={brandId} theme={theme} />
        </Section>

        <footer className="foot">
          <p className="foot-line">
            {brand.label} · {brand.tokens.length} 个 token · {manifest.permutations} 套排列 · {manifest.darkOverrides} 个深色覆盖
          </p>
          <p className="foot-note">
            下一步：页面级 recipe schema，把“生成闭环”也变成可校验的契约。
          </p>
        </footer>
      </main>
    </div>
  );
}
