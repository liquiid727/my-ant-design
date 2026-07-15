import type { ThemeConfig } from '../../types';
import { tokenRegistry } from '../theme/tokenRegistry';

export type DesignDocumentContext = {
  theme: ThemeConfig;
  preset?: {
    id: string;
    name: string;
    style: string;
  };
  generatedAt: string;
  contentVersion: '0709';
  studioVersion: string;
};

export class DesignDocumentError extends Error {
  readonly code = 'DESIGN_CONTEXT_INVALID';

  constructor(message = '当前主题数据不完整，无法生成 design.md') {
    super(message);
    this.name = 'DesignDocumentError';
  }
}

const isScalar = (value: unknown): value is string | number | boolean =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';

const formatValue = (value: string | number | boolean) => `\`${String(value)}\``;

const renderTokenGroup = (
  title: string,
  entries: Array<{ name: string; description: string; value: string | number | boolean }>,
) => {
  if (entries.length === 0) return `### ${title}\n\nNo explicit tokens are set for this group.`;
  return `### ${title}\n\n${entries
    .map(({ name, description, value }) => `- \`${name}\`: ${formatValue(value)} — ${description}`)
    .join('\n')}`;
};

const globalEntries = (theme: ThemeConfig) =>
  tokenRegistry.global.flatMap((meta) => {
    const value = (theme.token as Record<string, unknown>)[meta.name];
    return isScalar(value) ? [{ name: meta.name, description: meta.description, value }] : [];
  });

const componentSections = (theme: ThemeConfig) =>
  Object.entries(tokenRegistry.components).flatMap(([component, tokens]) => {
    const configured = theme.components?.[component as keyof ThemeConfig['components']] as Record<string, unknown> | undefined;
    const entries = tokens.flatMap((meta) => {
      const value = configured?.[meta.name];
      return isScalar(value) ? [{ name: meta.name, description: meta.description, value }] : [];
    });
    return entries.length > 0 ? [renderTokenGroup(component, entries)] : [];
  });

export const generateDesignMarkdown = (context: DesignDocumentContext): string => {
  const { theme } = context;
  if (!theme || typeof theme.name !== 'string' || !theme.token || !theme.components) {
    throw new DesignDocumentError();
  }

  const preset = context.preset ?? {
    id: theme.id || 'custom',
    name: theme.name || 'Custom Theme',
    style: 'Custom theme',
  };
  const globals = globalEntries(theme);
  const byGroup = new Map<string, typeof globals>();
  for (const entry of globals) {
    const group = tokenRegistry.global.find((meta) => meta.name === entry.name)?.group ?? 'Other';
    byGroup.set(group, [...(byGroup.get(group) ?? []), entry]);
  }

  return `# ${theme.name} Design System

## Document metadata

- Content version: \`${context.contentVersion}\`
- Generated at: \`${context.generatedAt}\`
- Theme Studio version: \`${context.studioVersion}\`
- Theme ID: \`${theme.id || 'custom'}\`
- Preset: ${preset.name} (\`${preset.id}\`)
- Algorithm: \`${theme.algorithm}\`

## Design intent

Use **${preset.style}** as the visual direction. Keep pages coherent by treating Ant Design components and the theme tokens below as the source of truth.

## Theme foundation

- Prefer Ant Design 6 components before custom controls.
- Apply this theme through \`ConfigProvider\`.
- Reuse existing project components before introducing new abstractions.

## Color system

${renderTokenGroup('Colors', byGroup.get('Colors') ?? [])}

## Typography

${renderTokenGroup('Typography', byGroup.get('Typography') ?? [])}

## Radius and borders

${renderTokenGroup('Border', byGroup.get('Border') ?? [])}

## Spacing and layout

${renderTokenGroup('Spacing', byGroup.get('Spacing') ?? [])}

- Use the registered spacing scale for page gutters and component rhythm.
- Keep content width responsive; do not make the page depend on a single viewport.

## Ant Design component rules

${componentSections(theme).join('\n\n') || 'No registered component overrides are explicitly set in the current theme.'}

## Interaction states

- Define loading, empty, error, disabled, hover, active, and focus-visible states.
- Preserve clear feedback and do not communicate status through color alone.
- Use component tokens for state styling before adding one-off CSS.

## Responsive rules

- Validate at desktop, tablet, and mobile widths.
- Allow long code and data regions to scroll internally without widening the page.
- Reflow dense multi-column layouts before reducing readable type sizes.

## Accessibility

- Keep semantic labels, keyboard access, visible focus, and sufficient contrast.
- Associate form feedback with its field and provide text for non-decorative icons.
- Respect reduced-motion preferences for non-essential animation.

## Agent implementation rules

### Allowed

- Ant Design components configured with global and component tokens.
- Existing shared components and local CSS needed for layout or documented exceptions.
- Responsive behavior derived from content needs and verified viewports.

### Prohibited

- Unexplained hard-coded colors, radii, shadows, or spacing.
- Reimplementing an existing Ant Design control without an accessibility or product requirement.
- Introducing a second theme system that bypasses \`ConfigProvider\`.

## Verification checklist

- [ ] Read this \`design.md\`, the theme file, and existing component structure.
- [ ] Verify loading, empty, error, disabled, hover, and focus states.
- [ ] Verify desktop, tablet, and mobile layouts.
- [ ] Run typecheck, build, and relevant UI tests.
- [ ] Report every new hard-coded visual value and its reason.
`;
};
