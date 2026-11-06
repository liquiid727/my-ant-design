import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ProviderSettings, openProviderSettings } from './components/provider-settings';
import { ToastHost } from './components/toast';
import { About } from './lab/About';
import { CasePage } from './lab/CasePage';
import { Home } from './lab/Home';
import { Matrix } from './lab/Matrix';
import { Method } from './lab/Method';
import { ResourcePage } from './lab/ResourcePage';
import { ThemeMenu } from './components/theme-menu';
import { Studio } from './lab/Studio';
import { exampleById } from './lab/examples';
import { brandsOf, type ThemeName } from './lab/model';
import { useRoute } from './lib/router';
import { preloadAdminStudio } from './lab/adminPreload';

/** 站点外壳是暗色的，预览也默认从深色开始；浅色仍然可以手动切换。 */
const initialTheme = (): ThemeName => 'dark';

/** 每个产品默认落在标了 featured 的品牌上；没有就取第一个。 */
const initialBrand = (appId: string) => {
  const list = brandsOf(appId);
  return (list.find((item) => item.featured) ?? list[0]).id;
};

const REPO = 'https://github.com/liquiid727/my-ant-design';

/** 主题工作室是 antd 消费者，按需加载，不进首屏包。 */
const AdminStudio = lazy(() => import('./lab/AdminStudio').then((module) => ({ default: module.AdminStudio })));

export default function App() {
  const route = useRoute();
  const [theme, setTheme] = useState<ThemeName>(initialTheme);
  const [app, setApp] = useState('ride');
  const [brand, setBrand] = useState(() => initialBrand('ride'));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.app = app;
    document.documentElement.dataset.brand = brand;
  }, [theme, app, brand]);

  const lastPage = useRef('');

  useEffect(() => {
    if (route.name === 'case') {
      const example = exampleById(route.example);
      setApp(example.app);
      setBrand(example.brand);
      setTheme(example.theme);
    }
    if (route.name === 'matrix') {
      if (route.app) setApp(route.app);
      if (route.theme === 'light' || route.theme === 'dark') setTheme(route.theme);
      if (route.brand) {
        const list = brandsOf(route.app ?? app);
        if (list.some((item) => item.id === route.brand)) setBrand(route.brand);
      }
    }

    // 只有"换页"才回到顶部；同一页内的参数变化（?type=、/method/output）不抢滚动
    const page = route.name === 'case' ? `case:${route.example}` : route.name;
    if (lastPage.current === page) return;
    lastPage.current = page;

    // 深链（方法页定位 / 关于页筛选）由页面自己滚动
    const deepLink = (route.name === 'method' && route.focus) || (route.name === 'about' && (route.filter || route.groupBy));
    if (deepLink) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [route]);

  const isCase = route.name === 'case';

  return (
    <div className="app">
      <header className="topbar">
        <a className="wordmark" href="#/" aria-label="Alro's studio 首页">
          Alro&apos;s studio
        </a>
        <span className="topbar-rule" />
        <span className="topbar-sub">Design Lab</span>

        <nav className="topbar-nav">
          <a href="#/" data-active={route.name === 'home'}>
            首页
          </a>
          <a href="#/studio" data-active={route.name === 'studio'}>
            工作台
          </a>
          <a href="#/matrix" data-active={route.name === 'matrix'}>
            排列
          </a>
          <a href="#/method" data-active={route.name === 'method'}>
            方法
          </a>
          <a href="#/resources" data-active={route.name === 'resources'}>
            资源
          </a>
          <a
            href="#/admin"
            data-active={route.name === 'admin'}
            onMouseEnter={preloadAdminStudio}
            onFocus={preloadAdminStudio}
          >
            主题工作室
          </a>
          <a href="#/about" data-active={route.name === 'about'}>
            关于
          </a>
        </nav>

        <div className="topbar-actions">
          {route.name === 'studio' ? (
            <div className="topbar-preview">
              <span className="topbar-preview-label">预览</span>
              <ThemeMenu value={theme} onChange={setTheme} />
            </div>
          ) : null}
          <button type="button" className="topbar-config" onClick={openProviderSettings}>
            配置
          </button>
          <a className="topbar-source" href={REPO} target="_blank" rel="noreferrer">
            源码 <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      {route.name === 'admin' ? (
        <Suspense fallback={<div className="admin-loading" role="status">正在加载主题工作室…</div>}>
          <AdminStudio path={route.path} />
        </Suspense>
      ) : route.name === 'case' ? (
        <CasePage exampleId={route.example} tab={route.tab} width={route.width} />
      ) : route.name === 'matrix' ? (
        <Matrix app={app} brand={brand} theme={theme} onApp={setApp} onBrand={setBrand} onTheme={setTheme} />
      ) : route.name === 'studio' ? (
        <Studio
          sample={route.sample}
          device={route.device}
          brand={route.brand}
          width={route.width}
          landscape={route.landscape}
          theme={theme}
          onTheme={setTheme}
        />
      ) : route.name === 'about' ? (
        <About filter={route.filter} groupBy={route.groupBy} search={route.search} preset={route.preset} phase={route.phase} />
      ) : route.name === 'method' ? (
        <Method focus={route.focus} />
      ) : route.name === 'resources' ? (
        <ResourcePage group={route.group} />
      ) : (
        <Home />
      )}

      <ProviderSettings />
      <ToastHost />

      {isCase || route.name === 'admin' ? null : (
        <footer className="site-foot">
          <span className="site-foot-mark">
            Alro&apos;s studio
            <span className="site-foot-tag">Design Lab · 2025</span>
          </span>
          <nav className="site-foot-links" aria-label="页脚">
            <a href="#/matrix">排列</a>
            <a href="#/method">方法</a>
            <a href="#/resources">资源</a>
            <a href="#/about">关于</a>
            <a href={REPO} target="_blank" rel="noreferrer">
              源代码 ↗
            </a>
          </nav>
          <span className="site-foot-note">Token-first design engineering</span>
        </footer>
      )}
    </div>
  );
}
