import type { ReactNode } from 'react';

/** 浏览器外壳：只负责“这是一个 Web 视口”，里面的页面完全由产品 token 驱动。 */
export const BrowserFrame = ({ url, meta, children }: { url: string; meta: string; children: ReactNode }) => (
  <div className="web-browser" role="group" aria-label="Web 界面预览">
    <div className="web-chrome">
      <span className="web-dots" aria-hidden="true" />
      <span className="web-address" title={url}>
        {url}
      </span>
      <span className="web-meta">{meta}</span>
      <span className="web-hint">横向滑动 →</span>
    </div>
    <div className="web-viewport">{children}</div>
  </div>
);
