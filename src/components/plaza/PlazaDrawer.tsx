import { AppstoreOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Drawer, Empty, Input, Skeleton, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import type { CommunityThemeMeta } from '../../services/community/types';
import { useCommunityStore } from '../../stores/communityStore';
import { useUIStore } from '../../stores/uiStore';
import { ThemeCard } from './ThemeCard';
import { ThemePreviewModal } from './ThemePreviewModal';

export function PlazaDrawer() {
  const isOpen = useUIStore((state) => state.isPlazaDrawerOpen);
  const closePlaza = useUIStore((state) => state.closePlaza);
  const loading = useCommunityStore((state) => state.loading);
  const error = useCommunityStore((state) => state.error);
  const index = useCommunityStore((state) => state.index);
  const searchQuery = useCommunityStore((state) => state.searchQuery);
  const selectedTags = useCommunityStore((state) => state.selectedTags);
  const fetchThemes = useCommunityStore((state) => state.fetchThemes);
  const setSearchQuery = useCommunityStore((state) => state.setSearchQuery);
  const toggleTag = useCommunityStore((state) => state.toggleTag);
  const filteredThemes = useCommunityStore((state) => state.filteredThemes);
  const availableTags = useCommunityStore((state) => state.availableTags);

  const [previewTheme, setPreviewTheme] = useState<CommunityThemeMeta | null>(null);

  useEffect(() => {
    if (isOpen) fetchThemes();
  }, [isOpen, fetchThemes]);

  const themes = filteredThemes();
  const tags = availableTags();
  const isCached = index?.source === 'cache';

  return (
    <>
      <Drawer
        title={null}
        open={isOpen}
        onClose={closePlaza}
        closable={false}
        className="plaza-drawer"
        size="large"
        styles={{
          body: { display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' },
          header: { display: 'none' },
        }}
      >
        {/* Header */}
        <div className="plaza-drawer-header">
          <div className="plaza-drawer-title">
            <div className="plaza-drawer-title-icon">
              <AppstoreOutlined />
            </div>
            <span>Theme Plaza</span>
          </div>
          <Space size={4}>
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => fetchThemes(true)}
              loading={loading}
            />
            <Button type="text" size="small" onClick={closePlaza} style={{ fontSize: 18, lineHeight: 1 }}>×</Button>
          </Space>
        </div>

        {/* Search & Filters */}
        <div className="plaza-search-area">
          <Input.Search
            placeholder="Search themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            className="plaza-search-input"
          />
          {tags.length > 0 && (
            <div className="plaza-tag-filters">
              {tags.map((tag) => (
                <Tag.CheckableTag
                  key={tag}
                  checked={selectedTags.includes(tag)}
                  onChange={() => toggleTag(tag)}
                >
                  {tag}
                </Tag.CheckableTag>
              ))}
            </div>
          )}
        </div>

        {/* Status banner */}
        {isCached && !loading && (
          <div className="plaza-cache-banner">
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Using cached data
            </Typography.Text>
          </div>
        )}

        {error && !index && (
          <div className="plaza-error-banner">
            <Typography.Text type="danger" style={{ fontSize: 12 }}>{error}</Typography.Text>
            <Button size="small" onClick={() => fetchThemes(true)}>Retry</Button>
          </div>
        )}

        {/* Theme Grid */}
        <div className="plaza-theme-grid">
          {loading && !index && (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="plaza-theme-card plaza-skeleton-card">
                  <Skeleton.Image active className="plaza-skeleton-image" />
                  <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} className="plaza-skeleton-text" />
                </div>
              ))}
            </>
          )}

          {!loading && themes.length === 0 && index && (
            <div className="plaza-empty-state">
              <Empty
                description={
                  <span>
                    No community themes yet.
                    <br />
                    <Typography.Link
                      href={`https://github.com/${useCommunityStore.getState().index ? 'liquiid-labs/theme' : ''}`}
                      target="_blank"
                    >
                      Be the first contributor!
                    </Typography.Link>
                  </span>
                }
              />
            </div>
          )}

          {themes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} onClick={() => setPreviewTheme(theme)} />
          ))}
        </div>
      </Drawer>

      <ThemePreviewModal
        theme={previewTheme}
        open={!!previewTheme}
        onClose={() => setPreviewTheme(null)}
      />
    </>
  );
}
