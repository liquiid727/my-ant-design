import { Button, Select, Tag } from 'antd';
import { useState } from 'react';
import { allComponentNames, componentTokens } from '../../services/theme/tokenRegistry';
import { useThemeStore } from '../../stores/themeStore';
import { TokenControl } from './TokenControl';

export function ComponentTokenEditor() {
  const [component, setComponent] = useState(allComponentNames[0]);
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const setComponentToken = useThemeStore((state) => state.setComponentToken);
  const setTheme = useThemeStore((state) => state.setTheme);
  const componentValues =
    (currentTheme.components[component as keyof typeof currentTheme.components] as Record<string, unknown> | undefined) ?? {};

  return (
    <>
      <Select
        value={component}
        style={{ width: '100%', marginBottom: 16 }}
        options={allComponentNames.map((name) => ({ value: name, label: name }))}
        onChange={setComponent}
      />
      {(componentTokens[component] ?? []).map((meta) => {
        const isOverridden = meta.name in componentValues;
        return (
          <div className="token-row" key={meta.name}>
            <label title={meta.description}>
              {meta.name} {isOverridden && <Tag color="blue">override</Tag>}
            </label>
            <TokenControl
              meta={meta}
              value={componentValues[meta.name] ?? meta.default}
              onChange={(value) => setComponentToken(component, meta.name, value)}
            />
          </div>
        );
      })}
      <Button
        block
        onClick={() => {
          const components = { ...currentTheme.components };
          delete components[component as keyof typeof components];
          setTheme({ components });
        }}
      >
        Reset Component
      </Button>
    </>
  );
}

