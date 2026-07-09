import { Tooltip } from 'antd';
import { presetThemes } from '../../services/theme/presets';
import { useThemeStore } from '../../stores/themeStore';

const themeIconUrls: Record<string, string> = {
  default: new URL('../../assets/theme-icons/default.png', import.meta.url).href,
  mui: new URL('../../assets/theme-icons/mui.png', import.meta.url).href,
  shadcn: new URL('../../assets/theme-icons/shadcn.png', import.meta.url).href,
  bootstrap: new URL('../../assets/theme-icons/bootstrap.png', import.meta.url).href,
  cartoon: new URL('../../assets/theme-icons/cartoon.png', import.meta.url).href,
  dark: new URL('../../assets/theme-icons/dark.png', import.meta.url).href,
  illustration: new URL('../../assets/theme-icons/illustration.png', import.meta.url).href,
  glass: new URL('../../assets/theme-icons/glass.png', import.meta.url).href,
  geek: new URL('../../assets/theme-icons/geek.png', import.meta.url).href,
  lark: new URL('../../assets/theme-icons/lark.png', import.meta.url).href,
  blossom: new URL('../../assets/theme-icons/blossom.png', import.meta.url).href,
  v4: new URL('../../assets/theme-icons/v4.png', import.meta.url).href,
  coffee: new URL('../../assets/theme-icons/coffee.png', import.meta.url).href,
};

export function PresetBar() {
  const selectedPresetId = useThemeStore((state) => state.selectedPresetId);
  const setPreset = useThemeStore((state) => state.setPreset);

  return (
    <div className="preset-bar" aria-label="Theme presets">
      {presetThemes.map((preset) => (
        <Tooltip key={preset.id} title={`${preset.name} - ${preset.style}`}>
          <button
            aria-label={preset.name}
            className={`preset-icon ${selectedPresetId === preset.id ? 'active' : ''}`}
            type="button"
            onClick={() => setPreset(preset.id)}
          >
            <img className="preset-icon-img" src={themeIconUrls[preset.id]} alt="" />
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
