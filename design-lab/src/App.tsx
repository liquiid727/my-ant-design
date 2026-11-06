import { useEffect, useRef, useState } from 'react';
import { ProviderSettings, openProviderSettings } from './components/provider-settings';
import { ToastHost } from './components/toast';
import { About } from './lab/About';
import { CasePage } from './lab/CasePage';
import { Home } from './lab/Home';
import { Method } from './lab/Method';
import { Studio } from './lab/Studio';
import { brandsOf, type ThemeName } from './lab/model';
import { useRoute } from './lib/router';

const initialTheme = (): ThemeName =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const REPO = 'https://github.com/liquiid727/my-ant-design';

export default function App() {
  const route = useRoute();
  const [theme, setTheme] = useState<ThemeName>(initialTheme);
  const [app, setApp] = useState('ride');
  const [brand, setBrand] = useState(brandsOf('ride')[0].id);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.app = app;
    document.documentElement.dataset.brand = brand;
  }, [theme, app, brand]);

  const lastPage = useRef('');

  useEffect(() => {
    if (route.name === 'case') {
      setApp(route.app);
      const brands = brandsOf(route.app);
      if (!brands.some((item) => item.id === brand)) setBrand(brands[0].id);
    }

    // 只有"换页"才回到顶部；同一页内的参数变化（?type=、/method/output）不抢滚动
    const page = route.name === 'case' ? `case:${route.app}` : route.name;
    if (lastPage.current === page) return;
    lastPage.current = page;

    // 深链（方法页定位 / 关于页筛选）由页面自己滚动
    const deepLink = (route.name === 'method' && route.focus) || (route.name === 'about' && (route.filter || route.groupBy));
    if (deepLink) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [route, brand]);

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
          <a href="#/method" data-active={route.name === 'method'}>
            方法
          </a>
          <a href="#/about" data-active={route.name === 'about'}>
            关于
          </a>
        </nav>

        <div className="topbar-actions">
          <button type="button" className="topbar-config" onClick={openProviderSettings}>
            配置
          </button>
          <a className="topbar-source" href={REPO} target="_blank" rel="noreferrer">
            源码 <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      {route.name === 'case' ? (
        <CasePage app={app} brand={brand} theme={theme} tab={route.tab} onBrand={setBrand} onTheme={setTheme} />
      ) : route.name === 'studio' ? (
        <Studio sample={route.sample} />
      ) : route.name === 'about' ? (
        <About filter={route.filter} groupBy={route.groupBy} search={route.search} preset={route.preset} phase={route.phase} />
      ) : route.name === 'method' ? (
        <Method focus={route.focus} />
      ) : (
        <Home theme={theme} onTheme={setTheme} />
      )}

      <ProviderSettings />
      <ToastHost />

      {isCase ? null : (
        <footer className="site-foot">
          <span className="site-foot-mark">
            Alro&apos;s studio
            <span className="site-foot-tag">Design Lab · 2025</span>
          </span>
          <nav className="site-foot-links" aria-label="页脚">
            <a href="#/method">方法</a>
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
