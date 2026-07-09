import { defaultSkin } from './default';
import { muiSkin } from './mui';
import { shadcnSkin } from './shadcn';
import { bootstrapSkin } from './bootstrap';
import { cartoonSkin } from './cartoon';
import { darkSkin } from './dark';
import { illustrationSkin } from './illustration';
import { glassSkin } from './glass';
import { geekSkin } from './geek';
import { larkSkin } from './lark';
import { blossomSkin } from './blossom';
import { v4Skin } from './v4';
import { coffeeSkin } from './coffee';
import { toSkinStyle } from './types';
import type { OfficialThemeSkin } from './types';

export type { OfficialThemeSkin } from './types';
export { toSkinStyle };

export const officialThemeSkins = [
  defaultSkin,
  muiSkin,
  shadcnSkin,
  bootstrapSkin,
  cartoonSkin,
  darkSkin,
  illustrationSkin,
  glassSkin,
  geekSkin,
  larkSkin,
  blossomSkin,
  v4Skin,
  coffeeSkin,
] satisfies OfficialThemeSkin[];

export const officialThemeSkinMap = Object.fromEntries(
  officialThemeSkins.map((skin) => [skin.id, skin]),
) as Record<string, OfficialThemeSkin>;

export const getOfficialThemeSkin = (id: string) => officialThemeSkinMap[id] ?? defaultSkin;
