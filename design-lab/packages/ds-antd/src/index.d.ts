export type AntdColor = string;

export type AntdThemeConfig = {
  schemaVersion: 1;
  id: string;
  name: string;
  algorithm: 'default' | 'dark';
  token: Record<string, string | number>;
  components: Record<string, Record<string, string | number>>;
};

export type DesignSet = {
  brand: string;
  brandLabel: string;
  theme: 'light' | 'dark';
  byPath: Map<string, { value: unknown }>;
};

export type ProjectedTheme = {
  config: AntdThemeConfig;
  missing: string[];
};

export declare const TOKEN_MAP: ReadonlyArray<{ token: string; path: string; read: (value: unknown) => unknown }>;

export declare function projectTheme(set: DesignSet): ProjectedTheme;
export declare function toAntdTheme(set: DesignSet): AntdThemeConfig;
