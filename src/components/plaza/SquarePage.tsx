import { AppstoreOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Empty, Input, Skeleton, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import type { CommunityThemeMeta } from '../../services/community/types';
import { CommunityThemeService } from '../../services/community/communityThemeService';
import { useCommunityStore } from '../../stores/communityStore';
import { ThemeCard } from './ThemeCard';
import { ThemePreviewModal } from './ThemePreviewModal';

export function SquarePage() {
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
  const repositoryUrl = CommunityThemeService.getRepoConfig().repositoryUrl;

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  const themes = filteredThemes();
  const tags = availableTags();
  const isCached = index?.source === 'cache';

  return (
    <section className="square-page">
      <div className="square-page-shell">
        <div className="square-page-header">
          <div>
            <div className="square-page-title">
              <div className="square-page-title-icon">
                <AppstoreOutlined />
              </div>
              <Typography.Title level={2}>Theme Square</Typography.Title>
            </div>
            <Typography.Paragraph type="secondary" className="square-page-description">
              Discover, preview, and copy themes contributed by the community.
            </Typography.Paragraph>
          </div>
          <Button icon={<ReloadOutlined />} onClick={() => fetchThemes(true)} loading={loading}>
            Refresh
          </Button>
        </div>

        <div className="plaza-search-area">
          <Input.Search
            placeholder="Search themes..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
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

        <div className="plaza-theme-grid">
          {loading && !index && (
            <>
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="plaza-theme-card plaza-skeleton-card">
                  <Skeleton.Image active className="plaza-skeleton-image" />
                  <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} className="plaza-skeleton-text" />
                </div>
              ))}
            </>
          )}

          {!loading && themes.length === 0 && index && (
            <div className="plaza-empty-state">
              <Empty
                description={(
                  <span>
                    No community themes yet.
                    <br />
                    <Typography.Link href={repositoryUrl} target="_blank" rel="noreferrer">
                      Be the first contributor!
                    </Typography.Link>
                  </span>
                )}
              />
            </div>
          )}

          {themes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} onClick={() => setPreviewTheme(theme)} />
          ))}
        </div>
      </div>

      <ThemePreviewModal
        theme={previewTheme}
        open={!!previewTheme}
        onClose={() => setPreviewTheme(null)}
      />
    </section>
  );
}
