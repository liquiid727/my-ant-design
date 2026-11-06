import { useMemo, useState } from 'react';
import { brandById, LAYER_LABEL, type ThemeName } from './model';

type Scope = 'public' | 'private' | 'all';

const SCOPES: { id: Scope; label: string }[] = [
  { id: 'public', label: '业务可见' },
  { id: 'private', label: '内部原色' },
  { id: 'all', label: '全部' },
];

export const TokenTable = ({ brand: brandId, theme }: { brand: string; theme: ThemeName }) => {
  const brand = brandById(brandId);
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<Scope>('public');

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return brand.tokens
      .filter((token) => (scope === 'all' ? true : scope === 'public' ? token.public : !token.public))
      .filter((token) => (needle ? token.path.toLowerCase().includes(needle) || token.type.includes(needle) : true))
      .slice(0, 220);
  }, [query, scope]);

  const total = brand.tokens.filter((token) => (scope === 'all' ? true : scope === 'public' ? token.public : !token.public)).length;

  return (
    <div className="tokens">
      <div className="tokens-bar">
        <label className="tokens-search">
          <span className="tokens-search-label">搜索</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="color.action / radius / motion"
            spellCheck={false}
          />
        </label>
        <div className="segmented" role="group" aria-label="范围">
          {SCOPES.map((item) => (
            <button
              key={item.id}
              type="button"
              className="segmented-item"
              data-active={scope === item.id}
              onClick={() => setScope(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="tokens-count">
          {rows.length} / {total}
        </p>
      </div>

      <div className="table-scroll">
      <table className="token-table">
        <colgroup>
          <col style={{ width: 36 }} />
          <col />
          <col style={{ width: 92 }} />
          <col style={{ width: 196 }} />
          <col style={{ width: 84 }} />
          <col style={{ width: 248 }} />
        </colgroup>
        <thead>
          <tr>
            <th aria-label="色值" />
            <th>token</th>
            <th>类型</th>
            <th>值（{theme === 'light' ? '浅色' : '深色'}）</th>
            <th>层</th>
            <th>来源</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((token) => (
            <tr key={token.path}>
              <td>
                {token.type === 'color' ? (
                  <span className="token-swatch" style={{ background: token.hex[theme] ?? token.values[theme] }} />
                ) : (
                  <span className="token-swatch token-swatch-empty" />
                )}
              </td>
              <td>
                <code className="token-path">{token.path}</code>
              </td>
              <td className="token-type">{token.type}</td>
              <td>
                <code className="token-value">{token.values[theme]}</code>
              </td>
              <td>
                <span className="token-layer" data-layer={token.layer}>
                  {LAYER_LABEL[token.layer] ?? token.layer}
                </span>
              </td>
              <td className="token-alias">{token.alias ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {rows.length === 0 ? <p className="tokens-empty">没有匹配的 token。换个关键词，或切到“全部”。</p> : null}
    </div>
  );
};
