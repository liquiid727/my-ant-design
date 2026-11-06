import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'about'; filter?: string; groupBy?: string; search?: string; preset?: string; phase?: string }
  | { name: 'method'; focus?: string }
  | { name: 'studio'; sample?: boolean; device?: string; brand?: string; width?: number; landscape?: boolean }
  | { name: 'case'; example: string; tab?: string; width?: number }
  | { name: 'resources'; group?: string }
  | { name: 'admin'; path: string }
  | { name: 'matrix'; app?: string; brand?: string; theme?: string };

export const parseRoute = (hash = window.location.hash): Route => {
  const clean = hash.replace(/^#/, '');
  const [path, query = ''] = clean.split('?');
  const params = new URLSearchParams(query);

  const match = path.match(/^\/case\/([a-z0-9-]+)(?:\/([a-z-]+))?/);
  if (match) return { name: 'case', example: match[1], tab: match[2], width: params.get('w') ? Number(params.get('w')) : undefined };

  if (path === '/matrix' || path === '/permutations')
    return {
      name: 'matrix',
      app: params.get('app') ?? undefined,
      brand: params.get('brand') ?? undefined,
      theme: params.get('theme') ?? undefined,
    };

  if (path === '/about')
    return {
      name: 'about',
      filter: params.get('type') ?? undefined,
      groupBy: params.get('by') ?? undefined,
      search: params.get('q') ?? undefined,
      preset: params.get('preset') ?? undefined,
      phase: params.get('phase') ?? undefined,
    };

  if (path === '/resources') return { name: 'resources', group: params.get('group') ?? undefined };

  // 挂载的 antd 主题工作室：#/admin 之后的路径交给它自己的内存路由
  if (path === '/admin' || path.startsWith('/admin/')) {
    return { name: 'admin', path: path.slice('/admin'.length) || '/' };
  }

  if (path === '/studio' || path === '/workbench') {
    return {
      name: 'studio',
      sample: params.get('sample') === '1',
      device: params.get('device') ?? undefined,
      brand: params.get('brand') ?? undefined,
      width: params.get('w') ? Number(params.get('w')) : undefined,
      landscape: params.get('o') === 'land' || undefined,
    };
  }

  const method = path.match(/^\/method(?:\/([a-z-]+))?$/);
  if (method) return { name: 'method', focus: method[1] };

  return { name: 'home' };
};

export const navigate = (path: string) => {
  window.location.hash = path;
};

export const useRoute = (): Route => {
  const [route, setRoute] = useState<Route>(() => parseRoute());

  useEffect(() => {
    const onChange = () => setRoute(parseRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
};
