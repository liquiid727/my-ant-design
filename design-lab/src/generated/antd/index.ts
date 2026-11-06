// 由 design-lab/pipeline/compiler 生成，请勿手改。改动请落在 tokens 源文件。
import theme0 from './cycling.dark.json';
import theme1 from './cycling.light.json';
import theme2 from './ledger.dark.json';
import theme3 from './ledger.light.json';
import theme4 from './noir.dark.json';
import theme5 from './noir.light.json';

export const antdThemes = {
  'cycling.dark': theme0,
  'cycling.light': theme1,
  'ledger.dark': theme2,
  'ledger.light': theme3,
  'noir.dark': theme4,
  'noir.light': theme5,
} as const;

export type AntdThemeId = keyof typeof antdThemes;
