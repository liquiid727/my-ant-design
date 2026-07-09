import { Button, Collapse } from 'antd';
import { globalTokens } from '../../services/theme/tokenRegistry';
import { useThemeStore } from '../../stores/themeStore';
import type { TokenMeta } from '../../types';
import { TokenControl } from './TokenControl';

export function GlobalTokenEditor() {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const setToken = useThemeStore((state) => state.setToken);
  const resetTheme = useThemeStore((state) => state.resetTheme);
  const groups = globalTokens.reduce<Record<string, TokenMeta[]>>((acc, token) => {
    acc[token.group] = [...(acc[token.group] ?? []), token];
    return acc;
  }, {});

  return (
    <>
      <Collapse
        defaultActiveKey={['Colors', 'Border']}
        items={Object.entries(groups).map(([group, tokens]) => ({
          key: group,
          label: group,
          children: (
            <>
              {tokens.map((meta) => (
                <div className="token-row" key={meta.name}>
                  <label title={meta.description}>{meta.name}</label>
                  <TokenControl
                    meta={meta}
                    value={currentTheme.token[meta.name as keyof typeof currentTheme.token] ?? meta.default}
                    onChange={(value) => setToken(meta.name, value)}
                  />
                </div>
              ))}
            </>
          ),
        }))}
      />
      <Button style={{ marginTop: 16 }} block onClick={resetTheme}>
        Reset to Preset
      </Button>
    </>
  );
}
