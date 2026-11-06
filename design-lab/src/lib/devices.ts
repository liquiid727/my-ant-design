/**
 * 设备档位：案例页的「现实界面」和工作台的「配方渲染」共用这一份，
 * 避免两边各自维护一套尺寸。
 */

export type SafeInset = { top: number; bottom: number; left: number; right: number };

export type DeviceKind = 'phone' | 'tablet' | 'desktop';

export type Device = {
  id: string;
  label: string;
  width: number;
  height: number;
  kind: DeviceKind;
  scale: number;
  dpr: number;
  /** Web 档位没有安全区，这里给 0 */
  safe: { portrait: SafeInset; landscape: SafeInset };
};

const noInset: SafeInset = { top: 0, bottom: 0, left: 0, right: 0 };
const noSafe = { portrait: noInset, landscape: noInset };

export const PHONE_DEVICES: Device[] = [
  {
    id: 'se',
    label: 'iPhone SE',
    width: 375,
    height: 667,
    scale: 0.56,
    dpr: 2,
    kind: 'phone',
    safe: { portrait: { top: 20, bottom: 0, left: 0, right: 0 }, landscape: noInset },
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

/** Web 档位：配方渲染用，案例页的手机框不展示它们。 */
export const WEB_DEVICES: Device[] = [
  { id: 'laptop', label: '笔记本 1280', width: 1280, height: 800, scale: 0.5, dpr: 2, kind: 'desktop', safe: noSafe },
  { id: 'desktop', label: '桌面 1440', width: 1440, height: 900, scale: 0.45, dpr: 2, kind: 'desktop', safe: noSafe },
];

export const DEVICES: Device[] = [...PHONE_DEVICES, ...WEB_DEVICES];

export const deviceById = (id: string | undefined) => DEVICES.find((device) => device.id === id);

/** 配方渲染用的一小撮：一个标准手机、一个大屏手机、一个平板、两个 Web。 */
export const RENDER_DEVICE_IDS = ['se', 'iphone-max', 'ipad-mini', 'laptop', 'desktop'] as const;

export const renderDevices = () => RENDER_DEVICE_IDS.map((id) => deviceById(id)).filter((device): device is Device => Boolean(device));
