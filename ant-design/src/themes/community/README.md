# Community Themes

Welcome! This directory holds community-contributed themes for Ant Design Theme Studio.

## How to Contribute

### Basic Theme (JSON — Zero Code Required)

1. Fork this repository
2. Create a JSON file in `src/themes/community/` named `{your-theme}-{4-char-suffix}.json`
3. Add a preview image (PNG, 800×500 px, ≤200KB) with the same base name
4. Submit a Pull Request

**JSON format:**

```json
{
  "id": "ocean-blue-a3x9",
  "name": "Ocean Blue",
  "author": "your-github-username",
  "description": "A calm ocean-inspired theme",
  "tags": ["blue", "calm", "light"],
  "preview": "ocean-blue-a3x9-preview.png",
  "config": {
    "algorithm": "default",
    "token": {
      "colorPrimary": "#0969da",
      "borderRadius": 8
    },
    "components": {}
  }
}
```

### Advanced Theme (TypeScript — Full Customization)

For themes that need custom CSS-in-JS overrides:

1. Create a folder: `src/themes/community/{theme-id}/`
2. Add `meta.json` (same fields as basic JSON, plus `"format": "advanced"`)
3. Add `theme.ts` exporting a `useXxxTheme` hook returning `ConfigProviderProps`
4. Add `preview.png`

```typescript
// theme.ts
import { createStyles } from 'antd-style';
import type { ConfigProviderProps } from 'antd';

const useStyles = createStyles(({ token }) => ({
  // custom CSS overrides
}));

export const useMyTheme = (): ConfigProviderProps => ({
  theme: {
    token: { colorPrimary: '#ff6b6b' },
    components: { Button: { borderRadius: 20 } },
  },
});

export default useMyTheme;
```

## Available Tokens

### Global Tokens

| Token | Type | Default | Description |
|-------|------|---------|-------------|
| colorPrimary | color | #1677FF | Primary brand color |
| colorSuccess | color | #52c41a | Success state color |
| colorWarning | color | #faad14 | Warning state color |
| colorError | color | #ff4d4f | Error state color |
| colorInfo | color | #1677FF | Informational color |
| colorBgBase | color | #ffffff | Base background color |
| colorTextBase | color | #000000 | Base text color |
| borderRadius | number | 6 | Base border radius |
| borderRadiusSM | number | 4 | Small border radius |
| borderRadiusLG | number | 8 | Large border radius |
| borderRadiusXS | number | 2 | Extra small radius |
| fontSize | number | 14 | Base font size |
| fontSizeSM | number | 12 | Small font size |
| fontSizeLG | number | 16 | Large font size |
| padding | number | 16 | Base padding |
| paddingSM | number | 12 | Small padding |
| paddingLG | number | 24 | Large padding |
| margin | number | 16 | Base margin |
| marginSM | number | 12 | Small margin |
| marginLG | number | 24 | Large margin |

### Component Tokens

- **Button**: borderRadius, controlHeight, fontWeight, primaryShadow
- **Input**: borderRadius, activeBorderColor, hoverBorderColor
- **Select**: borderRadius, optionSelectedBg
- **Card**: borderRadiusLG, colorBgContainer
- **Modal**: borderRadiusLG, titleFontSize
- **Alert**: borderRadiusLG
- **Table**: headerBg, rowHoverBg, borderColor
- **Menu**: itemSelectedBg, itemBorderRadius

## ID Naming Convention

Theme IDs use the format `{theme-name}-{4-char-random-suffix}`, e.g. `ocean-blue-a3x9`. This avoids collisions with official themes and other community themes.

## Preview Image

- **Size**: 800 × 500 pixels
- **Format**: PNG
- **Max file size**: 200KB
- **Filename**: `{theme-id}-preview.png`

## Local Preview

```bash
git clone https://github.com/YOUR_USERNAME/theme.git
cd theme
npm install
npm run dev
```

Your theme will appear in the Theme Plaza after submitting a PR and getting it merged.
