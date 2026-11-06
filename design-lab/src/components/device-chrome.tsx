/**
 * 设备外框里的"系统条"：手机/平板是状态栏，Web 是浏览器条。
 * 案例页的「现实界面」和工作台的「配方渲染」共用这一份，避免两份 chrome。
 */

type Props = {
  kind: 'phone' | 'tablet' | 'desktop' | string;
  /** 浏览器条上的地址，Web 用 */
  url?: string;
};

const StatusBar = () => (
  <div className="frame-status">
    <span>9:41</span>
    <span className="frame-status-icons" aria-hidden="true">
      ▮▮▮
    </span>
  </div>
);

const BrowserBar = ({ url }: { url: string }) => (
  <div className="frame-browser">
    <span className="frame-dots" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
    <span className="frame-url">{url}</span>
  </div>
);

export const DeviceChrome = ({ kind, url = 'design-lab.local' }: Props) =>
  kind === 'desktop' ? <BrowserBar url={url} /> : <StatusBar />;
