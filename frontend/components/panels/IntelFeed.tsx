'use client';

// components/panels/IntelFeed.tsx
// Left column — displays live news feed with urgency classification

import React, { useState, useEffect } from 'react';
import type { NewsArticle } from '../../lib/types';
import { timeAgo, formatLocalTime } from '../../lib/utils';

interface IntelFeedProps {
  articles: NewsArticle[];
  onSelect: (article: NewsArticle) => void;
}

function UrgencyBadge({ urgency }: { urgency: NewsArticle['urgency'] }) {
  if (urgency === 'breaking') {
    return (
      <span
        className="animate-pulse text-xs font-mono"
        style={{ color: '#ff0040', letterSpacing: '0.05em' }}
      >
        &#9889; BREAKING
      </span>
    );
  }
  if (urgency === 'developing') {
    return (
      <span
        className="text-xs font-mono"
        style={{ color: '#ffaa00', letterSpacing: '0.05em' }}
      >
        &#9654; DEVELOPING
      </span>
    );
  }
  // background
  return (
    <span
      className="inline-block w-2 h-2 rounded-none"
      style={{ backgroundColor: '#00ff41', verticalAlign: 'middle' }}
      title="BACKGROUND"
    />
  );
}

export default function IntelFeed({ articles, onSelect }: IntelFeedProps) {
  const [refreshTime, setRefreshTime] = useState<string>('');

  useEffect(() => {
    const tick = () => setRefreshTime(formatLocalTime(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex flex-col h-full panel-glow"
      style={{
        backgroundColor: '#0f1318',
        border: '1px solid #1e3a2f',
        overflow: 'hidden',
      }}
    >
      {/* Panel Header */}
      <div
        className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{
          borderBottom: '1px solid #1e3a2f',
          fontFamily: 'inherit',
        }}
      >
        <span
          className="text-xs font-mono tracking-widest"
          style={{ color: '#00ff41' }}
        >
          // INTEL FEED
        </span>
        <span className="text-xs font-mono" style={{ color: '#6b7f6b' }}>
          REFRESH: {refreshTime}
        </span>
      </div>

      {/* Article List */}
      <div className="flex-1 overflow-y-auto">
        {articles.map((article) => (
          <button
            key={article.id}
            onClick={() => onSelect(article)}
            className="w-full text-left px-3 py-3 block transition-colors"
            style={{
              borderBottom: '1px solid #1e3a2f',
              borderLeft:
                article.urgency === 'breaking'
                  ? '2px solid #ff0040'
                  : '2px solid transparent',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'rgba(0,255,65,0.04)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'transparent';
            }}
          >
            {/* Urgency + Source Row */}
            <div className="flex items-center gap-2 mb-1">
              <UrgencyBadge urgency={article.urgency} />
              <span
                className="text-xs font-mono uppercase"
                style={{ color: '#6b7f6b', letterSpacing: '0.05em' }}
              >
                {article.source}
              </span>
              {article.category && (
                <span
                  className="text-xs font-mono"
                  style={{
                    color: '#1e3a2f',
                    backgroundColor: '#6b7f6b',
                    padding: '0 4px',
                    fontSize: '10px',
                  }}
                >
                  {article.category}
                </span>
              )}
            </div>

            {/* Headline */}
            <p
              className="text-sm font-mono leading-snug mb-1"
              style={{ color: '#c8d8c0' }}
            >
              {article.title}
            </p>

            {/* Time */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono" style={{ color: '#6b7f6b' }} suppressHydrationWarning>
                {timeAgo(article.publishedAt)}
              </span>
              <span className="text-xs font-mono" style={{ color: '#1e3a2f' }}>
                |
              </span>
              <span
                className="text-xs font-mono"
                style={{ color: '#6b7f6b', fontSize: '10px' }}
                suppressHydrationWarning
              >
                {formatLocalTime(new Date(article.publishedAt))}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
