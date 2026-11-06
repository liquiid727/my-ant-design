import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'about' }
  | { name: 'method' }
  | { name: 'case'; app: string; tab?: string };

export const parseRoute = (hash = window.location.hash): Route => {
  const clean = hash.replace(/^#/, '');
  const match = clean.match(/^\/case\/([a-z0-9-]+)(?:\/([a-z-]+))?/);
  if (match) return { name: 'case', app: match[1], tab: match[2] };
  if (clean === '/about') return { name: 'about' };
  if (clean === '/method') return { name: 'method' };
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
