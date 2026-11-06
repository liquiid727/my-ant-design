import { screensOf } from '../apps';
import { PhoneFrame } from '../components/ui';
import { navigate } from '../lib/router';
import { PermutationGrid } from './PermutationGrid';
import { appLabel, apps, brandById, brandsOf, manifest, type ThemeName } from './model';
import { Segmented } from '../components/controls';

/** 全部排列：产品 × 品牌 × 主题，一次性看全。示例页从这里挑一种身份。 */
export const Matrix = ({
  app,
  brand,
  theme,
  onApp,
  onBrand,
  onTheme,
}: {
  app: string;
  brand: string;
  theme: ThemeName;
  onApp: (app: string) => void;
  onBrand: (brand: string) => void;
  onTheme: (theme: ThemeName) => void;
}) => {
  const screens = screensOf(app);
  const brandInfo = brandById(app, brand);

  const changeApp = (next: string) => {
    onApp(next);
    const nextBrands = brandsOf(next);
    if (!nextBrands.some((item) => item.id === brand)) onBrand(nextBrands[0].id);
  };

  return (
    <div className="matrix">
      <header className="page-head">
        <p className="eyebrow">排列矩阵 · Permutations</p>
        <h1 className="page-title">{manifest.permutations} 套排列，一次看全</h1>
        <p className="page-lede">
          产品 × 品牌 × 主题。示例页各自固定一种身份；这里改一处变量，下面的实例就换一种样子。
          点任意一张卡片切换，或直接用上面的三组开关。
        </p>
      </header>

      <section className="matrix-section">
        <div className="matrix-controls">
          <Segmented
            label="产品"
            value={app}
            options={apps.map((item) => ({ id: item.id, label: item.label }))}
            onChange={changeApp}
          />

          <Segmented
            label="品牌"
            value={brand}
            options={brandsOf(app).map((item) => ({ id: item.id, label: item.label }))}
            onChange={onBrand}
          />

          <Segmented
            label="主题"
            value={theme}
            options={[
              { id: 'light', label: '浅色' },
              { id: 'dark', label: '深色' },
            ]}
            onChange={onTheme}
          />

          <p className="matrix-meta">
            {appLabel(app)} · {brandInfo.label} · {theme === 'light' ? '浅色' : '深色'}
          </p>
        </div>

        <PermutationGrid app={app} activeBrand={brand} activeTheme={theme} onPick={(nextBrand, nextTheme) => {
          onBrand(nextBrand);
          onTheme(nextTheme);
        }} />

        <div className="matrix-screens">
          <div className="matrix-screens-head">
            <div>
              <h2 className="panel-title">{appLabel(app)}实例</h2>
              <p className="panel-note">{screens.length} 屏全部由 token 与组件契约拼出来，当前排列会直接作用到这些屏。</p>
            </div>
            <button type="button" className="case-matrix-link" onClick={() => navigate('/')}>
              ← 回到示例
            </button>
          </div>

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
      </section>
    </div>
  );
};
