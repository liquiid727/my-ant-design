import { buildRamp, contrast, readableOn, tint, type Ramp } from './oklch';

export type WorkbenchInput = {
  id: string;
  label: string;
  latin: string;
  seed: string;
  font: 'serif' | 'sans';
  radius: 'small' | 'medium' | 'large';
};

type Tokens = Record<string, unknown>;

export type GeneratedTheme = { tokens: Tokens; resolved: Record<string, string> };
export type GeneratedPack = { light: GeneratedTheme; dark: GeneratedTheme; ramp: Ramp; warnings: string[] };

const FONTS = {
  serif: ['Songti SC', 'Source Han Serif SC', 'Georgia', 'serif'],
  sans: ['-apple-system', 'PingFang SC', 'Helvetica Neue', 'sans-serif'],
} as const;

const MONO = ['SF Mono', 'ui-monospace', 'Menlo', 'monospace'];

const RADIUS = {
  small: { control: '8px', card: '12px', sheet: '16px' },
  medium: { control: '10px', card: '18px', sheet: '26px' },
  large: { control: '14px', card: '24px', sheet: '34px' },
} as const;

const token = (type: string, value: string) => ({ $type: type, $value: value });
const alias = (type: string, path: string) => ({ $type: type, $value: `{${path}}` });

export const generatePack = (input: WorkbenchInput): GeneratedPack => {
  const ramp = buildRamp(input.seed);
  const warnings: string[] = [];

  // 明色：表面几乎无色，文字压深；行动色取阶梯 500/600/700
  const lightSurface = {
    canvas: tint(input.seed, 0.975, 0.25, 0.02),
    raised: tint(input.seed, 0.995, 0.12, 0.012),
    sunken: tint(input.seed, 0.94, 0.3, 0.028),
  };
  const lightInk = {
    primary: tint(input.seed, 0.24, 0.3, 0.035),
    secondary: tint(input.seed, 0.44, 0.25, 0.03),
    tertiary: tint(input.seed, 0.56, 0.2, 0.025),
  };
  const lightBorder = {
    subtle: tint(input.seed, 0.9, 0.25, 0.02),
    strong: tint(input.seed, 0.82, 0.28, 0.025),
  };

  const darkSurface = {
    canvas: tint(input.seed, 0.15, 0.35, 0.02),
    raised: tint(input.seed, 0.2, 0.3, 0.02),
    sunken: tint(input.seed, 0.11, 0.3, 0.018),
  };
  const darkInk = {
    primary: tint(input.seed, 0.96, 0.1, 0.012),
    secondary: tint(input.seed, 0.84, 0.15, 0.018),
    tertiary: tint(input.seed, 0.7, 0.18, 0.02),
  };
  const darkBorder = {
    subtle: tint(input.seed, 0.28, 0.3, 0.02),
    strong: tint(input.seed, 0.36, 0.3, 0.022),
  };

  const light = {
    tokens: {
      brand: {
        palette: {
          $type: 'color',
          seed: token('color', input.seed.toUpperCase()),
          ...Object.fromEntries(Object.entries(ramp).map(([step, value]) => [step, token('color', value)])),
        },
      },
      color: {
        surface: {
          $type: 'color',
          canvas: token('color', lightSurface.canvas),
          raised: token('color', lightSurface.raised),
          sunken: token('color', lightSurface.sunken),
          inverse: alias('color', 'brand.palette.900'),
          'accent-soft': alias('color', 'brand.palette.100'),
        },
        ink: {
          $type: 'color',
          primary: token('color', lightInk.primary),
          secondary: token('color', lightInk.secondary),
          tertiary: token('color', lightInk.tertiary),
          inverse: alias('color', 'brand.palette.50'),
          'on-accent': token('color', readableOn(ramp['200'])),
        },
        action: {
          $type: 'color',
          primary: alias('color', 'brand.palette.500'),
          'primary-hover': alias('color', 'brand.palette.600'),
          'primary-pressed': alias('color', 'brand.palette.700'),
          'on-primary': token('color', readableOn(ramp['500'])),
          secondary: alias('color', 'brand.palette.700'),
          'on-secondary': token('color', readableOn(ramp['700'])),
        },
        border: {
          $type: 'color',
          subtle: token('color', lightBorder.subtle),
          strong: token('color', lightBorder.strong),
          focus: alias('color', 'brand.palette.600'),
        },
        brand: {
          $type: 'color',
          mark: alias('color', 'brand.palette.600'),
          halo: alias('color', 'brand.palette.100'),
        },
      },
      radius: {
        $type: 'dimension',
        control: token('dimension', RADIUS[input.radius].control),
        card: token('dimension', RADIUS[input.radius].card),
        sheet: token('dimension', RADIUS[input.radius].sheet),
      },
      type: {
        display: {
          family: token('fontFamily', JSON.stringify(FONTS[input.font])),
          size: token('dimension', '32px'),
          line: token('dimension', '38px'),
          weight: token('fontWeight', '600'),
          tracking: token('dimension', '-0.3px'),
        },
        title: {
          family: token('fontFamily', JSON.stringify(FONTS[input.font])),
          size: token('dimension', '22px'),
          line: token('dimension', '28px'),
          weight: token('fontWeight', '600'),
          tracking: token('dimension', '0px'),
        },
        metric: {
          family: token('fontFamily', JSON.stringify(MONO)),
          size: token('dimension', '40px'),
          line: token('dimension', '44px'),
          weight: token('fontWeight', '600'),
          tracking: token('dimension', '-0.5px'),
        },
      },
    },
    resolved: {
      'color.surface.canvas': lightSurface.canvas,
      'color.surface.raised': lightSurface.raised,
      'color.surface.sunken': lightSurface.sunken,
      'color.surface.inverse': ramp['900'],
      'color.surface.accent-soft': ramp['100'],
      'color.ink.primary': lightInk.primary,
      'color.ink.secondary': lightInk.secondary,
      'color.ink.tertiary': lightInk.tertiary,
      'color.ink.inverse': ramp['50'],
      'color.ink.on-accent': readableOn(ramp['200']),
      'color.action.primary': ramp['500'],
      'color.action.primary-hover': ramp['600'],
      'color.action.primary-pressed': ramp['700'],
      'color.action.on-primary': readableOn(ramp['500']),
      'color.action.secondary': ramp['700'],
      'color.action.on-secondary': readableOn(ramp['700']),
      'color.border.subtle': lightBorder.subtle,
      'color.border.strong': lightBorder.strong,
      'color.border.focus': ramp['600'],
      'color.brand.mark': ramp['600'],
      'color.brand.halo': ramp['100'],
    },
  } satisfies GeneratedTheme;

  const dark = {
    tokens: {
      brand: {
        palette: {
          $type: 'color',
          seed: token('color', input.seed.toUpperCase()),
          ...Object.fromEntries(Object.entries(ramp).map(([step, value]) => [step, token('color', value)])),
        },
      },
      color: {
        surface: {
          $type: 'color',
          canvas: token('color', darkSurface.canvas),
          raised: token('color', darkSurface.raised),
          sunken: token('color', darkSurface.sunken),
          inverse: alias('color', 'brand.palette.50'),
          'accent-soft': alias('color', 'brand.palette.900'),
        },
        ink: {
          $type: 'color',
          primary: token('color', darkInk.primary),
          secondary: token('color', darkInk.secondary),
          tertiary: token('color', darkInk.tertiary),
          inverse: alias('color', 'brand.palette.900'),
          'on-accent': token('color', readableOn(ramp['300'])),
        },
        action: {
          $type: 'color',
          primary: alias('color', 'brand.palette.400'),
          'primary-hover': alias('color', 'brand.palette.300'),
          'primary-pressed': alias('color', 'brand.palette.500'),
          'on-primary': token('color', readableOn(ramp['400'])),
          secondary: alias('color', 'brand.palette.300'),
          'on-secondary': token('color', readableOn(ramp['300'])),
        },
        border: {
          $type: 'color',
          subtle: token('color', darkBorder.subtle),
          strong: token('color', darkBorder.strong),
          focus: alias('color', 'brand.palette.400'),
        },
        brand: {
          $type: 'color',
          mark: alias('color', 'brand.palette.400'),
          halo: alias('color', 'brand.palette.800'),
        },
      },
      radius: {
        $type: 'dimension',
        control: token('dimension', RADIUS[input.radius].control),
        card: token('dimension', RADIUS[input.radius].card),
        sheet: token('dimension', RADIUS[input.radius].sheet),
      },
    },
    resolved: {
      'color.surface.canvas': darkSurface.canvas,
      'color.surface.raised': darkSurface.raised,
      'color.surface.sunken': darkSurface.sunken,
      'color.surface.inverse': ramp['50'],
      'color.surface.accent-soft': ramp['900'],
      'color.ink.primary': darkInk.primary,
      'color.ink.secondary': darkInk.secondary,
      'color.ink.tertiary': darkInk.tertiary,
      'color.ink.inverse': ramp['900'],
      'color.ink.on-accent': readableOn(ramp['300']),
      'color.action.primary': ramp['400'],
      'color.action.primary-hover': ramp['300'],
      'color.action.primary-pressed': ramp['500'],
      'color.action.on-primary': readableOn(ramp['400']),
      'color.action.secondary': ramp['300'],
      'color.action.on-secondary': readableOn(ramp['300']),
      'color.border.subtle': darkBorder.subtle,
      'color.border.strong': darkBorder.strong,
      'color.border.focus': ramp['400'],
      'color.brand.mark': ramp['400'],
      'color.brand.halo': ramp['800'],
    },
  } satisfies GeneratedTheme;

  // 生成阶段就自检一遍：主按钮文字和正文的对比度最容易翻车
  for (const [theme, pack] of [
    ['浅色', light],
    ['深色', dark],
  ] as [string, GeneratedTheme][]) {
    const pairs: [string, string, number][] = [
      ['color.ink.primary', 'color.surface.canvas', 4.5],
      ['color.ink.secondary', 'color.surface.canvas', 4.5],
      ['color.action.on-primary', 'color.action.primary', 4.5],
      ['color.ink.tertiary', 'color.surface.canvas', 3],
    ];
    for (const [fg, bg, min] of pairs) {
      const ratio = contrast(pack.resolved[fg], pack.resolved[bg]);
      if (ratio < min) warnings.push(`${theme}：${fg} 在 ${bg} 上只有 ${ratio.toFixed(2)}:1（需要 ${min}:1）`);
    }
  }

  return { light, dark, ramp, warnings };
};

export const brandJson = (pack: GeneratedPack['light'], id: string) =>
  JSON.stringify(
    {
      $description: `由 design-lab 工作台生成 · 品牌包 ${id}`,
      ...pack.tokens,
    },
    null,
    2,
  );
