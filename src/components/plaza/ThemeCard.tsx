import { Tag, Typography } from 'antd';
import { useState } from 'react';
import { CommunityThemeService } from '../../services/community/communityThemeService';
import type { CommunityThemeMeta } from '../../services/community/types';

type ThemeCardProps = {
  theme: CommunityThemeMeta;
  onClick: () => void;
};

export function ThemeCard({ theme, onClick }: ThemeCardProps) {
  const [imgError, setImgError] = useState(false);
  const primaryColor = (theme.config.token.colorPrimary as string) ?? '#1677FF';

  return (
    <div
      className="plaza-theme-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="plaza-card-preview">
        {theme.preview && !imgError ? (
          <img
            src={CommunityThemeService.getPreviewUrl(theme.preview)}
            alt={theme.name}
            loading="lazy"
            draggable={false}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="plaza-card-preview-fallback"
            style={{ background: `linear-gradient(135deg, ${primaryColor}22 0%, ${primaryColor}66 100%)` }}
          >
            <div className="plaza-card-color-dot" style={{ background: primaryColor }} />
          </div>
        )}
      </div>
      <div className="plaza-card-info">
        <Typography.Text strong ellipsis className="plaza-card-name">{theme.name}</Typography.Text>
        <Typography.Text type="secondary" className="plaza-card-author">by {theme.author}</Typography.Text>
        <div className="plaza-card-tags">
          {theme.tags.slice(0, 3).map((tag) => (
            <Tag key={tag} className="plaza-card-tag">{tag}</Tag>
          ))}
        </div>
      </div>
    </div>
  );
}
