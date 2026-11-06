import { useEffect, useState } from 'react';
import { About } from './lab/About';
import { CasePage } from './lab/CasePage';
import { Home } from './lab/Home';
import { Method } from './lab/Method';
import { brandsOf, type ThemeName } from './lab/model';
import { useRoute } from './lib/router';

const initialTheme = (): ThemeName =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

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

  useEffect(() => {
    if (route.name === 'case') {
      setApp(route.app);
      const brands = brandsOf(route.app);
      if (!brands.some((item) => item.id === brand)) setBrand(brands[0].id);
    }
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
        <span className="topbar-sub">Token 设计工程</span>

        <nav className="topbar-nav">
          <a href="#/" data-active={route.name === 'home'}>
            首页
          </a>
          <a href="#/method" data-active={route.name === 'method'}>
            方法
          </a>
          <a href="#/about" data-active={route.name === 'about'}>
            关于
          </a>
        </nav>

        {isCase ? null : (
          <div className="topbar-actions">
            <div className="segmented" role="group" aria-label="主题">
              {(['light', 'dark'] as ThemeName[]).map((item) => (
                <button key={item} type="button" className="segmented-item" data-active={theme === item} onClick={() => setTheme(item)}>
                  {item === 'light' ? '浅色' : '深色'}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {route.name === 'case' ? (
        <CasePage app={app} brand={brand} theme={theme} tab={route.tab} onBrand={setBrand} onTheme={setTheme} />
      ) : route.name === 'about' ? (
        <About />
      ) : route.name === 'method' ? (
        <Method />
      ) : (
        <Home theme={theme} />
      )}

      <footer className="site-foot">
        <span className="site-foot-mark">Alro&apos;s studio</span>
        <span className="site-foot-note">Token-first design engineering · 2025</span>
      </footer>
    </div>
  );
}
