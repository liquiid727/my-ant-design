import { BrowserFrame } from '../components/web';
import { brandById, type ThemeName } from './model';
import { NoirWeb } from './noir-web';

/** Web 预览：品牌 / 主题沿用示例页的固定身份，不另开一套状态。 */
export const WebPreview = ({ app, brand, theme }: { app: string; brand: string; theme: ThemeName }) => {
  const brandInfo = brandById(app, brand);
  return (
    <div className="web-stage">
      <BrowserFrame
        url={`${brand}.alro.studio/?theme=${theme}`}
        meta={`Web · 1160 · ${brandInfo.label} · ${theme === 'light' ? '浅色' : '深色'}`}
      >
        <NoirWeb />
      </BrowserFrame>
      <p className="web-note">桌面排版 · 1160 宽 · 全长预览 · 窄屏可横向滚动查看</p>
    </div>
  );
};
