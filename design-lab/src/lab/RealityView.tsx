import { useEffect, useState } from 'react';
import { layoutBucket, type Breakpoints } from '@ds/core';
import { screensOf } from '../apps';
import { Segmented } from '../components/controls';
import { DeviceChrome } from '../components/device-chrome';
import { DEVICES as ALL_DEVICES, type Device } from '../lib/devices';
import { appLabel, brandById, breakpointsOf, type ThemeName } from './model';

const DEVICES = ALL_DEVICES;

const bucketOf = (width: number, breakpoints: Breakpoints) => layoutBucket(width, breakpoints);

type Settings = { landscape: boolean; safeArea: boolean };

const DEFAULTS: Settings = { landscape: false, safeArea: false };

const kindOfWidth = (width: number) => (width >= 900 ? 'desktop' : width >= 600 ? 'tablet' : 'phone');

const DeviceCard = ({
  device,
  settings,
  breakpoints,
  overrideWidth,
  onToggle,
  children,
}: {
  device: Device;
  settings: Settings;
  breakpoints: Breakpoints;
  overrideWidth?: number | null;
  onToggle: (patch: Partial<Settings>) => void;
  children: React.ReactNode;
}) => {
  const baseWidth = overrideWidth ?? (settings.landscape ? device.height : device.width);
  const width = overrideWidth ?? baseWidth;
  const height = overrideWidth
    ? Math.round(overrideWidth * (device.height / device.width))
    : settings.landscape
      ? device.width
      : device.height;
  const kind = overrideWidth ? kindOfWidth(overrideWidth) : device.kind;
  // 横屏按"高度可读"来缩放，否则 852 宽的机器会被压成一条细带
  const scale = overrideWidth
    ? Math.min(1, 560 / width)
    : settings.landscape
      ? Math.min(0.5, 420 / width)
      : device.scale;
  const inset = settings.landscape ? device.safe.landscape : device.safe.portrait;
  const bucket = bucketOf(width, breakpoints);

  return (
    <figure className="device" data-kind={kind}>
      <figcaption className="device-caption">
        <span className="device-name">{device.label}</span>
        <span className="device-size">
          {width} × {height} · {device.dpr}× · {Math.round(scale * 100)}%
        </span>
      </figcaption>

      <div className="device-viewport" data-kind={kind} style={{ width: width * scale, height: height * scale }}>
        <div className="device-screen" data-kind={kind} style={{ width, height, transform: `scale(${scale})` }}>
          <DeviceChrome kind={kind} url={device.label.split(' ')[0].toLowerCase() + '.local'} />
          <div className="reality-body">{children}</div>

          {settings.safeArea && kind !== 'desktop' ? (
            <>
              <span className="safe-gutter safe-top" style={{ height: inset.top }} />
              <span className="safe-gutter safe-bottom" style={{ height: inset.bottom }} />
              <span className="safe-gutter safe-left" style={{ width: inset.left }} />
              <span className="safe-gutter safe-right" style={{ width: inset.right }} />
            </>
          ) : null}
        </div>
      </div>

      <div className="device-options">
        {kind === 'desktop' ? null : (
          <>
            <button
              type="button"
              className="device-chip"
              data-active={settings.landscape}
              onClick={() => onToggle({ landscape: !settings.landscape })}
            >
              {settings.landscape ? '横屏' : '竖屏'}
            </button>
            <button type="button" className="device-chip" data-active={settings.safeArea} onClick={() => onToggle({ safeArea: !settings.safeArea })}>
              安全区
            </button>
          </>
        )}
        <span className="device-bucket" data-bucket={bucket}>
          {bucket}
        </span>
      </div>
    </figure>
  );
};

export const RealityView = ({
  app,
  brand,
  theme,
  width: widthParam,
}: {
  app: string;
  brand: string;
  theme: ThemeName;
  width?: number;
}) => {
  const screens = screensOf(app);
  const [active, setActive] = useState(screens[0].id);
  const [filter, setFilter] = useState<'all' | 'phone' | 'tablet' | 'web'>('all');
  const [settings, setSettings] = useState<Record<string, Settings>>({});
  const [customWidth, setCustomWidth] = useState<number | null>(widthParam ?? null);

  useEffect(() => {
    setActive(screens[0].id);
  }, [app, screens]);

  const current = screens.find((screen) => screen.id === active) ?? screens[0];
  const Screen = current.component;
  const brandInfo = brandById(app, brand);
  const filtered = DEVICES.filter((device) =>
    filter === 'all' ? true : filter === 'web' ? device.kind === 'desktop' : device.kind === filter,
  );

  // 自定义宽度单独成一张卡，不把其它机型一起拉伸
  const customDevice: Device | null = customWidth
    ? {
        id: 'custom',
        label: '自定义',
        width: customWidth,
        height: Math.round(customWidth * 1.6),
        scale: Math.min(1, 560 / customWidth),
        dpr: 2,
        kind: kindOfWidth(customWidth) as Device['kind'],
        safe: { portrait: { top: 0, bottom: 0, left: 0, right: 0 }, landscape: { top: 0, bottom: 0, left: 0, right: 0 } },
      }
    : null;

  const visible = customDevice ? [customDevice, ...filtered] : filtered;
  const settingsOf = (device: Device) => settings[device.id] ?? DEFAULTS;
  const breakpoints = breakpointsOf(app);

  return (
    <div className="reality">
      <div className="reality-bar">
        <Segmented
          label="屏幕"
          value={current.id}
          options={screens.map((screen) => ({ id: screen.id, label: screen.label }))}
          onChange={setActive}
        />

        <Segmented
          label="设备类型"
          value={filter}
          options={[
            { id: 'all', label: '全部' },
            { id: 'phone', label: '手机' },
            { id: 'tablet', label: '平板' },
            { id: 'web', label: 'Web' },
          ]}
          onChange={setFilter}
        />

        <label className="reality-width">
          宽
          <input
            type="number"
            min={320}
            max={1600}
            placeholder="自适应"
            value={customWidth ?? ''}
            onChange={(event) => {
              const next = Number(event.target.value);
              const value = next >= 320 && next <= 1600 ? Math.round(next) : null;
              setCustomWidth(value);
              // 刷新后不丢：写进 hash 的查询串
              const base = window.location.hash.split('?')[0] || '#/';
              window.history.replaceState(null, '', value ? `${base}?w=${value}` : base);
            }}
          />
          px
        </label>

        <p className="reality-meta">
          {appLabel(app)} · {brandInfo.label} · {theme === 'light' ? '浅色' : '深色'} · 断点 {breakpoints.tablet} / {breakpoints.wide}
        </p>
      </div>

      <div className="reality-grid">
        {visible.map((device) => {
          const state = settingsOf(device);
          return (
            <DeviceCard
              key={device.id}
              device={device}
              settings={state}
              breakpoints={breakpoints}
              onToggle={(patch) => setSettings((previous) => ({ ...previous, [device.id]: { ...state, ...patch } }))}
            >
              <Screen />
            </DeviceCard>
          );
        })}
      </div>

      <p className="reality-note">
        每台机型可以单独切横竖屏、开关安全区；标签是当前宽度落入的布局档位（compact / medium / expanded）。
        宽度、留白、断行都按真实视口计算，只有外层容器缩放。这一页用的是容器查询；
        小程序里同一套规则由 <code>.layout-medium</code> class 表达，见 README。
      </p>
    </div>
  );
};
