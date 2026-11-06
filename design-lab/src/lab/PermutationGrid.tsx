import type { CSSProperties } from 'react';
import { brandById, brandsOf, overriddenCount, themeNames, valueOf, type ThemeName } from './model';


const COPY: Record<string, { title: string; metric: string; unit: string; primary: string; ghost: string }> = {
  ride: { title: '西湖西溪绿道', metric: '23.4', unit: 'km', primary: '开始骑行', ghost: '收藏' },
  ledger: { title: '本月支出', metric: '¥3,482.50', unit: '', primary: '记一笔', ghost: '看报表' },
};

const SWATCHES = [
  'color.surface.canvas',
  'color.surface.raised',
  'color.action.primary',
  'color.ink.primary',
  'color.surface.accent-soft',
];

const PermutationCard = ({
  app,
  brandId,
  theme,
  active,
  onPick,
}: {
  app: string;
  brandId: string;
  theme: ThemeName;
  active: boolean;
  onPick: (brandId: string, theme: ThemeName) => void;
}) => {
  const brand = brandById(app, brandId);
  const copy = COPY[app] ?? COPY.ride;
  const vars = {
    '--perm-canvas': valueOf(app, brandId, 'color.surface.canvas', theme),
    '--perm-raised': valueOf(app, brandId, 'color.surface.raised', theme),
    '--perm-ink': valueOf(app, brandId, 'color.ink.primary', theme),
    '--perm-muted': valueOf(app, brandId, 'color.ink.tertiary', theme),
    '--perm-accent': valueOf(app, brandId, 'color.action.primary', theme),
    '--perm-on-accent': valueOf(app, brandId, 'color.action.on-primary', theme),
    '--perm-line': valueOf(app, brandId, 'color.border.subtle', theme),
  } as unknown as CSSProperties;

  return (
    <button type="button" className="perm" data-active={active} onClick={() => onPick(brandId, theme)} aria-pressed={active}>
      <span className="perm-head">
        <span className="perm-name">
          <span className="perm-dot" style={{ background: valueOf(app, brandId, 'color.brand.mark', theme) }} />
          {brand.label} · {theme === 'light' ? '浅色' : '深色'}
        </span>
        <span className="perm-meta">
          {theme === 'light' ? `${brand.tokens.length} 个 token` : `${overriddenCount(app, brandId)} 个变量被覆盖`}
        </span>
      </span>
      <span className="perm-stage" style={vars}>
        <span className="perm-eyebrow">SURFACE / INK / ACTION</span>
        <span className="perm-title">{copy.title}</span>
        <span className="perm-metric">
          {copy.metric}
          <span className="perm-unit">{copy.unit}</span>
        </span>
        <span className="perm-actions">
          <span className="perm-btn">{copy.primary}</span>
          <span className="perm-btn-ghost">{copy.ghost}</span>
        </span>
      </span>
      <span className="perm-swatches">
        {SWATCHES.map((path) => (
          <span key={path} className="perm-swatch" style={{ background: valueOf(app, brandId, path, theme) }} />
        ))}
      </span>
      <span className="perm-foot">{active ? '当前预览使用这套排列' : '点击切换预览'}</span>
    </button>
  );
};

export const PermutationGrid = ({
  app,
  activeBrand,
  activeTheme,
  onPick,
}: {
  app: string;
  activeBrand: string;
  activeTheme: ThemeName;
  onPick: (brandId: string, theme: ThemeName) => void;
}) => (
  <div className="perm-grid">
    {brandsOf(app).map((brand) =>
      themeNames.map((theme) => (
        <PermutationCard
          key={`${brand.id}-${theme}`}
          app={app}
          brandId={brand.id}
          theme={theme}
          active={brand.id === activeBrand && theme === activeTheme}
          onPick={onPick}
        />
      )),
    )}
  </div>
);
