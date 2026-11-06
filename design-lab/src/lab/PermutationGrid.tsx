import type { CSSProperties } from 'react';
import { brandById, brands, overriddenCount, themeNames, valueOf, type ThemeName } from './model';

const SWATCHES = [
  'color.surface.canvas',
  'color.surface.raised',
  'color.action.primary',
  'color.ink.primary',
  'color.surface.accent-soft',
];

const PermutationCard = ({
  brandId,
  theme,
  active,
  onPick,
}: {
  brandId: string;
  theme: ThemeName;
  active: boolean;
  onPick: (brandId: string, theme: ThemeName) => void;
}) => {
  const brand = brandById(brandId);
  const vars = {
    '--perm-canvas': valueOf(brandId, 'color.surface.canvas', theme),
    '--perm-raised': valueOf(brandId, 'color.surface.raised', theme),
    '--perm-ink': valueOf(brandId, 'color.ink.primary', theme),
    '--perm-muted': valueOf(brandId, 'color.ink.tertiary', theme),
    '--perm-accent': valueOf(brandId, 'color.action.primary', theme),
    '--perm-on-accent': valueOf(brandId, 'color.action.on-primary', theme),
    '--perm-line': valueOf(brandId, 'color.border.subtle', theme),
  } as unknown as CSSProperties;

  return (
    <button type="button" className="perm" data-active={active} onClick={() => onPick(brandId, theme)} aria-pressed={active}>
      <span className="perm-head">
        <span className="perm-name">
          <span className="perm-dot" style={{ background: valueOf(brandId, 'color.brand.mark', theme) }} />
          {brand.label} · {theme === 'light' ? '浅色' : '深色'}
        </span>
        <span className="perm-meta">
          {theme === 'light' ? `${brand.tokens.length} 个 token` : `${overriddenCount(brandId)} 个变量被覆盖`}
        </span>
      </span>
      <span className="perm-stage" style={vars}>
        <span className="perm-eyebrow">SURFACE / INK / ACTION</span>
        <span className="perm-title">{theme === 'light' ? '西湖西溪绿道' : '把风留在纸上'}</span>
        <span className="perm-metric">
          23.4<span className="perm-unit">km</span>
        </span>
        <span className="perm-actions">
          <span className="perm-btn">开始骑行</span>
          <span className="perm-btn-ghost">收藏</span>
        </span>
      </span>
      <span className="perm-swatches">
        {SWATCHES.map((path) => (
          <span key={path} className="perm-swatch" style={{ background: valueOf(brandId, path, theme) }} />
        ))}
      </span>
      <span className="perm-foot">{active ? '当前预览使用这套排列' : '点击切换预览'}</span>
    </button>
  );
};

export const PermutationGrid = ({
  activeBrand,
  activeTheme,
  onPick,
}: {
  activeBrand: string;
  activeTheme: ThemeName;
  onPick: (brandId: string, theme: ThemeName) => void;
}) => (
  <div className="perm-grid">
    {brands.map((brand) =>
      themeNames.map((theme) => (
        <PermutationCard
          key={`${brand.id}-${theme}`}
          brandId={brand.id}
          theme={theme}
          active={brand.id === activeBrand && theme === activeTheme}
          onPick={onPick}
        />
      )),
    )}
  </div>
);
