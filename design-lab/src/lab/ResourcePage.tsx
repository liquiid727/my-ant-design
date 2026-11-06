import type { ReactNode } from 'react';
import { navigate } from '../lib/router';
import {
  ADOPTED,
  CAPTURED_AT,
  FEATURED,
  GROUPS,
  RESOURCES,
  groupById,
  logoSrc,
  previewSrc,
  resourceById,
  resourcesOf,
  type GroupId,
  type IconId,
  type Resource,
} from './resources';

const GAPS = RESOURCES.filter((resource) => resource.state === 'gap').length;

const ICONS: Record<IconId, ReactNode> = {
  compass: (
    <>
      <circle cx="9" cy="9" r="6.4" />
      <path d="M11.9 6.1 10.3 10.3 6.1 11.9 7.7 7.7Z" />
    </>
  ),
  braces: (
    <>
      <path d="M7.2 3.4c-1.7 0-2.3.8-2.3 2.4v1.2c0 1-.6 1.5-1.7 1.5v1c1.1 0 1.7.5 1.7 1.5v1.2c0 1.6.6 2.4 2.3 2.4" />
      <path d="M10.8 3.4c1.7 0 2.3.8 2.3 2.4v1.2c0 1 .6 1.5 1.7 1.5v1c-1.1 0-1.7.5-1.7 1.5v1.2c0 1.6-.6 2.4-2.3 2.4" />
    </>
  ),
  wave: <path d="M1.8 11c2 0 2-4.4 4-4.4s2 4.4 4 4.4 2-4.4 4-4.4 2 4.4 2.4 4.4" />,
  check: (
    <>
      <rect x="2.8" y="2.8" width="12.4" height="12.4" rx="3.4" />
      <path d="m6 9.3 2.1 2.1 4-4.4" />
    </>
  ),
  diff: (
    <>
      <rect x="3" y="6.6" width="8.4" height="8.4" rx="1.6" />
      <path d="M6.6 3h6.8a1.6 1.6 0 0 1 1.6 1.6v6.8" />
    </>
  ),
  terminal: (
    <>
      <rect x="2.4" y="3.6" width="13.2" height="10.8" rx="2.4" />
      <path d="m5.6 7.4 2 1.8-2 1.8M9.8 11h2.8" />
    </>
  ),
};

const GroupIcon = ({ icon }: { icon: IconId }) => (
  <svg className="res-group-icon" viewBox="0 0 18 18" aria-hidden="true">
    {ICONS[icon]}
  </svg>
);

const statusLabel = { adopted: '已进管线', gap: '待补' } as const;

const Arrow = () => (
  <span className="res-arrow" aria-hidden="true">
    ↗
  </span>
);

const FeaturedCard = ({ resource }: { resource: Resource }) => (
  <article className="res-feature">
    <div className="res-feature-media">
      <img src={previewSrc(resource.id)} alt={`${resource.name} 的页面截图`} width={900} height={562} decoding="async" />
      <span className="res-feature-tag">{resource.tag}</span>
    </div>
    <div className="res-feature-body">
      <img className="res-logo res-logo-sm" src={logoSrc(resource.id)} alt="" width={30} height={30} loading="lazy" />
      <div className="res-feature-id">
        <h3 className="res-feature-name">
          <a className="res-stretch" href={resource.href} target="_blank" rel="noreferrer">
            {resource.name}
            <Arrow />
          </a>
        </h3>
        <p className="res-feature-claim">{resource.claim}</p>
      </div>
    </div>
  </article>
);

const ResourceCard = ({ resource }: { resource: Resource }) => (
  <li className="res-card">
    <div className="res-card-top">
      <img className="res-logo" src={logoSrc(resource.id)} alt="" width={40} height={40} loading="lazy" />
      <div className="res-card-id">
        <h3 className="res-card-name">
          <a className="res-stretch" href={resource.href} target="_blank" rel="noreferrer">
            {resource.name}
            <Arrow />
          </a>
        </h3>
        <p className="res-card-meta">
          {resource.kind} · {resource.license}
          {resource.stars ? ` · ${resource.stars}★` : ''}
        </p>
      </div>
    </div>

    <p className="res-card-claim">{resource.claim}</p>

    <div className="res-card-foot">
      <span className="res-tag">{resource.tag}</span>
      {resource.state ? (
        <span className="res-state" data-tone={resource.state}>
          {statusLabel[resource.state]}
        </span>
      ) : null}
      {resource.inside ? (
        <a className="res-inside" href={`#${resource.inside.to}`}>
          {resource.inside.label} →
        </a>
      ) : null}
    </div>
  </li>
);

const FEATURED_TAGS = FEATURED.map((id) => resourceById(id)?.tag)
  .filter(Boolean)
  .join(' · ');

export const ResourcePage = ({ group }: { group?: string }) => {
  const requested = group ?? '';
  const active: GroupId | null = groupById(requested)?.id ?? null;
  const invalid = requested.length > 0 && active === null;
  const visible = active ? GROUPS.filter((item) => item.id === active) : GROUPS;
  const shown = active ? resourcesOf(active).length : RESOURCES.length;

  return (
    <div className="resources">
      <header className="page-head resources-head">
        <p className="eyebrow">资源 · Resources</p>
        <h1 className="page-title">
          {RESOURCES.length} 个项目，<br className="res-title-break" />
          补上 token 管不到的那一层
        </h1>
        <p className="page-lede">
          管线管得住颜色、间距、时长，管不住"这一屏该长什么样"。下面按流程排好，每条只留一句话和一个"补哪一步"的标签。
        </p>

        <dl className="res-stats">
          <div>
            <dt>项目</dt>
            <dd>{RESOURCES.length}</dd>
          </div>
          <div>
            <dt>分组</dt>
            <dd>{GROUPS.length}</dd>
          </div>
          <div>
            <dt>已进管线</dt>
            <dd>{ADOPTED.length}</dd>
          </div>
          <div>
            <dt>待补</dt>
            <dd>{GAPS}</dd>
          </div>
        </dl>
      </header>

      <section className="res-featured" aria-labelledby="res-featured-title">
        <header className="res-section-head">
          <h2 className="res-section-title" id="res-featured-title">
            先看这四个
          </h2>
          <p className="res-section-note">{FEATURED_TAGS}</p>
        </header>
        <div className="res-featured-grid">
          {FEATURED.map((id) => {
            const resource = resourceById(id);
            return resource ? <FeaturedCard key={id} resource={resource} /> : null;
          })}
        </div>
      </section>

      <div className="res-index">
        <div className="res-filter" role="group" aria-label="按用途筛选">
          <button
            type="button"
            className="res-chip"
            data-active={active === null}
            aria-pressed={active === null}
            onClick={() => navigate('/resources')}
          >
            全部
            <span>{RESOURCES.length}</span>
          </button>
          {GROUPS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="res-chip"
              data-active={active === item.id}
              aria-pressed={active === item.id}
              onClick={() => navigate(`/resources?group=${item.id}`)}
            >
              {item.label}
              <span>{resourcesOf(item.id).length}</span>
            </button>
          ))}
          <span className="res-filter-note" role="status">
            按流程排，不按 star · 当前 {shown} 个
          </span>
        </div>

        {invalid ? (
          <p className="res-hint" role="status">
            链接里的分组「{requested}」不存在，已显示全部。
            <button type="button" className="res-hint-link" onClick={() => navigate('/resources')}>
              回到全部
            </button>
          </p>
        ) : null}

        <div className="res-groups">
          {visible.map((item) => (
            <section className="res-group" id={`res-${item.id}`} key={item.id} aria-labelledby={`res-${item.id}-title`}>
              <header className="res-group-head">
                <span className="res-group-index">{item.index}</span>
                <GroupIcon icon={item.icon} />
                <h2 className="res-group-title" id={`res-${item.id}-title`}>
                  {item.label}
                  <span className="res-group-en">{item.en}</span>
                </h2>
                <p className="res-group-lede">{item.lede}</p>
                <span className="res-group-count">{resourcesOf(item.id).length} 个</span>
              </header>
              <ul className="res-grid">
                {resourcesOf(item.id).map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <footer className="res-foot">
        <p className="res-foot-rule">收录标准：开源 · 有约束 · 能落产物 · 有人用</p>
        <p className="res-foot-note">图标与预览来自各项目官网（{CAPTURED_AT}），版权归原项目。</p>
        <a className="res-foot-link" href="https://github.com/liquiid727/my-ant-design/issues" target="_blank" rel="noreferrer">
          缺了哪个？开 issue 提名 <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </div>
  );
};
