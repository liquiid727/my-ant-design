import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'about'; filter?: string; groupBy?: string; search?: string; preset?: string; phase?: string }
  | { name: 'method'; focus?: string }
  | { name: 'studio'; sample?: boolean }
  | { name: 'case'; app: string; tab?: string };

export const parseRoute = (hash = window.location.hash): Route => {
  const clean = hash.replace(/^#/, '');
  const [path, query = ''] = clean.split('?');
  const params = new URLSearchParams(query);

  const match = path.match(/^\/case\/([a-z0-9-]+)(?:\/([a-z-]+))?/);
  if (match) return { name: 'case', app: match[1], tab: match[2] };

  if (path === '/about')
    return {
      name: 'about',
      filter: params.get('type') ?? undefined,
      groupBy: params.get('by') ?? undefined,
      search: params.get('q') ?? undefined,
      preset: params.get('preset') ?? undefined,
      phase: params.get('phase') ?? undefined,
    };

  if (path === '/studio' || path === '/workbench') return { name: 'studio', sample: params.get('sample') === '1' };

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
