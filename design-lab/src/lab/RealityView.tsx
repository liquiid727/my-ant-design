import { useEffect, useState } from 'react';
import { layoutBucket, type Breakpoints } from '@ds/core';
import { screensOf } from '../apps';
import { appLabel, brandById, breakpointsOf, type ThemeName } from './model';

type SafeInset = { top: number; bottom: number; left: number; right: number };

type Device = {
  id: string;
  label: string;
  width: number;
  height: number;
  scale: number;
  dpr: number;
  kind: 'phone' | 'tablet';
  safe: { portrait: SafeInset; landscape: SafeInset };
};

const DEVICES: Device[] = [
  {
    id: 'se',
    label: 'iPhone SE',
    width: 375,
    height: 667,
    scale: 0.56,
    dpr: 2,
    kind: 'phone',
    safe: { portrait: { top: 20, bottom: 0, left: 0, right: 0 }, landscape: { top: 0, bottom: 0, left: 0, right: 0 } },
  },
  {
    id: 'iphone-15',
    label: 'iPhone 15 Pro',
    width: 393,
    height: 852,
    scale: 0.535,
    dpr: 3,
    kind: 'phone',
    safe: { portrait: { top: 59, bottom: 34, left: 0, right: 0 }, landscape: { top: 0, bottom: 21, left: 59, right: 59 } },
  },
  {
    id: 'iphone-max',
    label: 'iPhone 16 Pro Max',
    width: 440,
    height: 956,
    scale: 0.477,
    dpr: 3,
    kind: 'phone',
    safe: { portrait: { top: 62, bottom: 34, left: 0, right: 0 }, landscape: { top: 0, bottom: 21, left: 62, right: 62 } },
  },
  {
    id: 'pixel',
    label: 'Pixel 7',
    width: 412,
    height: 915,
    scale: 0.51,
    dpr: 2.625,
    kind: 'phone',
    safe: { portrait: { top: 24, bottom: 24, left: 0, right: 0 }, landscape: { top: 0, bottom: 24, left: 24, right: 24 } },
  },
  {
    id: 'galaxy',
    label: 'Galaxy S21',
    width: 360,
    height: 800,
    scale: 0.583,
    dpr: 3,
    kind: 'phone',
    safe: { portrait: { top: 24, bottom: 16, left: 0, right: 0 }, landscape: { top: 0, bottom: 16, left: 24, right: 24 } },
  },
  {
    id: 'fold',
    label: 'Fold 外屏',
    width: 344,
    height: 882,
    scale: 0.61,
    dpr: 2.6,
    kind: 'phone',
    safe: { portrait: { top: 24, bottom: 16, left: 0, right: 0 }, landscape: { top: 0, bottom: 16, left: 24, right: 24 } },
  },
  {
    id: 'ipad-mini',
    label: 'iPad mini',
    width: 744,
    height: 1133,
    scale: 0.34,
    dpr: 2,
    kind: 'tablet',
    safe: { portrait: { top: 24, bottom: 20, left: 0, right: 0 }, landscape: { top: 24, bottom: 20, left: 0, right: 0 } },
  },
  {
    id: 'ipad-pro',
    label: 'iPad Pro 11',
    width: 834,
    height: 1194,
    scale: 0.3,
    dpr: 2,
    kind: 'tablet',
    safe: { portrait: { top: 24, bottom: 20, left: 0, right: 0 }, landscape: { top: 24, bottom: 20, left: 0, right: 0 } },
  },
];

const bucketOf = (width: number, breakpoints: Breakpoints) => layoutBucket(width, breakpoints);

type Settings = { landscape: boolean; safeArea: boolean };

const DEFAULTS: Settings = { landscape: false, safeArea: false };

const DeviceCard = ({
  device,
  settings,
  breakpoints,
  onToggle,
  children,
}: {
  device: Device;
  settings: Settings;
  breakpoints: Breakpoints;
  onToggle: (patch: Partial<Settings>) => void;
  children: React.ReactNode;
}) => {
  const width = settings.landscape ? device.height : device.width;
  const height = settings.landscape ? device.width : device.height;
  // 横屏按"高度可读"来缩放，否则 852 宽的机器会被压成一条细带
  const scale = settings.landscape ? Math.min(0.5, 420 / width) : device.scale;
  const inset = settings.landscape ? device.safe.landscape : device.safe.portrait;
  const bucket = bucketOf(width, breakpoints);

  return (
    <figure className="device" data-kind={device.kind}>
      <figcaption className="device-caption">
        <span className="device-name">{device.label}</span>
        <span className="device-size">
          {width} × {height} · {device.dpr}×
        </span>
      </figcaption>

      <div className="device-viewport" style={{ width: width * scale, height: height * scale }}>
        <div className="device-screen" data-kind={device.kind} style={{ width, height, transform: `scale(${scale})` }}>
          <div className="reality-status">
            <span>9:41</span>
            <span className="reality-status-icons" aria-hidden="true">
              ▮▮▮
            </span>
          </div>
          <div className="reality-body">{children}</div>

          {settings.safeArea ? (
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
        <span className="device-bucket" data-bucket={bucket}>
          {bucket}
        </span>
      </div>
    </figure>
  );
};

export const RealityView = ({ app, brand, theme }: { app: string; brand: string; theme: ThemeName }) => {
  const screens = screensOf(app);
  const [active, setActive] = useState(screens[0].id);
  const [filter, setFilter] = useState<'all' | 'phone' | 'tablet'>('all');
  const [settings, setSettings] = useState<Record<string, Settings>>({});

  useEffect(() => {
    setActive(screens[0].id);
  }, [app, screens]);

  const current = screens.find((screen) => screen.id === active) ?? screens[0];
  const Screen = current.component;
  const brandInfo = brandById(app, brand);
  const visible = DEVICES.filter((device) => filter === 'all' || device.kind === filter);
  const settingsOf = (device: Device) => settings[device.id] ?? DEFAULTS;
  const breakpoints = breakpointsOf(app);

  return (
    <div className="reality">
      <div className="reality-bar">
        <div className="segmented" role="group" aria-label="屏幕">
          {screens.map((screen) => (
            <button
              key={screen.id}
              type="button"
              className="segmented-item"
              data-active={screen.id === current.id}
              onClick={() => setActive(screen.id)}
            >
              {screen.label}
            </button>
          ))}
        </div>

        <div className="segmented" role="group" aria-label="设备类型">
          {[
            { id: 'all', label: '全部' },
            { id: 'phone', label: '手机' },
            { id: 'tablet', label: '平板' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className="segmented-item"
              data-active={filter === item.id}
              onClick={() => setFilter(item.id as typeof filter)}
            >
              {item.label}
            </button>
          ))}
        </div>

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
