import { Fragment } from 'react';
import { Tooltip } from 'antd';
import {
  customThemePresets,
  officialThemePresets,
  prefetchThemePreset,
} from '../../themes/registry';
import { useThemeStore } from '../../stores/themeStore';

export function PresetBar() {
  const selectedPresetId = useThemeStore((state) => state.activePresetId);
  const setPreset = useThemeStore((state) => state.setPreset);
  const presets = [...officialThemePresets, ...customThemePresets];

  return (
    <div className="preset-bar" aria-label="Theme presets" role="tablist">
      {presets.map((preset, index) => {
        const Icon = preset.icon;
        const showCustomDivider =
          preset.group === 'custom' && index > 0 && presets[index - 1]?.group !== 'custom';
        return (
          <Fragment key={preset.id}>
            {showCustomDivider && <span className="preset-divider" aria-hidden="true" />}
            <Tooltip title={`${preset.name} - ${preset.style}`} placement="top">
              <button
                aria-label={preset.name}
                aria-selected={selectedPresetId === preset.id}
                className={`preset-icon ${selectedPresetId === preset.id ? 'active' : ''}`}
                role="tab"
                tabIndex={selectedPresetId === preset.id ? 0 : -1}
                type="button"
                onClick={() => setPreset(preset.id)}
                onMouseEnter={() => void prefetchThemePreset(preset.id)}
                onFocus={() => void prefetchThemePreset(preset.id)}
              >
                {typeof Icon === 'string' ? (
                  <img className="preset-icon-img" src={Icon} alt="" draggable={false} />
                ) : (
                  <Icon className="preset-icon-svg" aria-hidden="true" />
                )}
              </button>
            </Tooltip>
          </Fragment>
        );
      })}
    </div>
  );
}
