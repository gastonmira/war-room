'use client';

// components/panels/SocialSignals.tsx
// Right column bottom — displays OSINT social intelligence feed

import React from 'react';
import type { SocialPost } from '../../lib/types';
import { timeAgo, formatLocalDateTime } from '../../lib/utils';

interface SocialSignalsProps {
  posts: SocialPost[];
}

export default function SocialSignals({ posts }: SocialSignalsProps) {
  // Display newest first
  const sorted = [...posts].sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
  );

  return (
    <div
      className="flex flex-col panel-glow"
      style={{
        backgroundColor: '#0f1318',
        border: '1px solid #1e3a2f',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* Panel Header */}
      <div
        className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid #1e3a2f' }}
      >
        <span
          className="text-xs font-mono tracking-widest"
          style={{ color: '#00ff41' }}
        >
          // SIGNALS INTELLIGENCE (OSINT)
        </span>
        <span className="text-xs font-mono" style={{ color: '#6b7f6b' }}>
          {posts.length} SIGNALS
        </span>
      </div>

      {/* Posts List */}
      <div className="flex-1 overflow-y-auto">
        {sorted.map((post) => (
          <div
            key={post.id}
            style={{
              padding: '10px 12px',
              borderBottom: '1px solid #1e3a2f',
            }}
          >
            {/* Handle + Time */}
            <div className="flex items-center justify-between mb-1">
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono"
                style={{
                  color: '#00ff41',
                  textDecoration: 'none',
                  letterSpacing: '0.03em',
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLAnchorElement).style.textDecoration = 'underline')
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLAnchorElement).style.textDecoration = 'none')
                }
              >
                {post.handle}
              </a>
              <span className="text-xs font-mono" style={{ color: '#6b7f6b', fontSize: '10px' }} suppressHydrationWarning>
                {timeAgo(post.postedAt)}
              </span>
            </div>

            {/* Display Name */}
            <div className="mb-1">
              <span
                className="text-xs font-mono"
                style={{ color: '#6b7f6b', fontSize: '10px' }}
                suppressHydrationWarning
              >
                {post.displayName.toUpperCase()} &middot; {formatLocalDateTime(post.postedAt)}
              </span>
            </div>

            {/* Content */}
            <p
              className="text-xs font-mono leading-relaxed"
              style={{ color: '#c8d8c0', lineHeight: '1.5' }}
            >
              {post.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
