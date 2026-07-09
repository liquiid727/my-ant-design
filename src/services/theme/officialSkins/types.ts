import type { CSSProperties } from 'react';

export type OfficialThemeSkin = {
  id: string;
  className: string;
  vars: Record<`--${string}`, string>;
};

export const toSkinStyle = (skin: OfficialThemeSkin): CSSProperties => skin.vars as CSSProperties;
