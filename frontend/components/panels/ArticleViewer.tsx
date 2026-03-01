'use client';

// components/panels/ArticleViewer.tsx
// Center panel — displays full parsed article content

import React from 'react';
import type { ParsedArticle } from '../../lib/types';
import { formatLocalDateTime } from '../../lib/utils';

interface ArticleViewerProps {
  article: ParsedArticle | null;
  loading: boolean;
}

function ClassifiedDefault() {
  return (
    <div
      className="flex flex-col items-center justify-center h-full"
      style={{ padding: '40px 24px', gap: '16px' }}
    >
      {/* CLASSIFIED watermark */}
      <div
        className="font-mono text-center"
        style={{
          color: '#1e3a2f',
          fontSize: '48px',
          fontWeight: 'bold',
          letterSpacing: '0.3em',
          lineHeight: 1,
          userSelect: 'none',
          border: '3px solid #1e3a2f',
          padding: '12px 24px',
        }}
      >
        CLASSIFIED
      </div>

      <p className="text-xs font-mono text-center" style={{ color: '#6b7f6b' }}>
        SELECT INTEL REPORT TO DECRYPT
      </p>

      {/* Redacted text simulation */}
      <div className="w-full" style={{ marginTop: '24px', opacity: 0.3 }}>
        {[80, 95, 60, 85, 70, 90, 55, 75, 88, 65].map((width, i) => (
          <div
            key={i}
            className="redacted-block"
            style={{
              width: `${width}%`,
              height: '12px',
              marginBottom: '8px',
              backgroundColor: '#1e3a2f',
              display: 'block',
            }}
          />
        ))}
      </div>

      <div
        className="font-mono text-center text-xs mt-4"
        style={{ color: '#1e3a2f', letterSpacing: '0.2em' }}
      >
        &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      className="flex flex-col items-center justify-center h-full"
      style={{ padding: '40px 24px', gap: '12px' }}
    >
      <span
        className="text-sm font-mono blink-cursor animate-pulse"
        style={{ color: '#00ff41', letterSpacing: '0.15em' }}
      >
        ACQUIRING DATA...
      </span>
      <span className="text-xs font-mono" style={{ color: '#6b7f6b' }}>
        DECRYPTING FIELD REPORT
      </span>
      <div
        style={{
          width: '200px',
          height: '2px',
          backgroundColor: '#1e3a2f',
          marginTop: '8px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="animate-pulse"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '60%',
            backgroundColor: '#00ff41',
          }}
        />
      </div>
    </div>
  );
}

export default function ArticleViewer({ article, loading }: ArticleViewerProps) {
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
        style={{ borderBottom: '1px solid #1e3a2f' }}
      >
        <span
          className="text-xs font-mono tracking-widest"
          style={{ color: '#00ff41' }}
        >
          // FIELD REPORT
        </span>
        {article && (
          <span className="text-xs font-mono" style={{ color: '#6b7f6b' }}>
            SOURCE: {article.source.toUpperCase()}
          </span>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <LoadingState />
        ) : !article ? (
          <ClassifiedDefault />
        ) : (
          <div style={{ padding: '20px 24px' }}>
            {/* Article Meta */}
            <div
              className="mb-4 pb-3"
              style={{ borderBottom: '1px solid #1e3a2f' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="text-xs font-mono"
                  style={{
                    color: '#00ff41',
                    backgroundColor: 'rgba(0,255,65,0.1)',
                    padding: '2px 6px',
                    border: '1px solid #1e3a2f',
                  }}
                >
                  {article.source.toUpperCase()}
                </span>
                {article.author && (
                  <span
                    className="text-xs font-mono"
                    style={{ color: '#6b7f6b' }}
                  >
                    BY {article.author.toUpperCase()}
                  </span>
                )}
              </div>

              {article.publishedAt && (
                <div className="text-xs font-mono" style={{ color: '#6b7f6b' }} suppressHydrationWarning>
                  {formatLocalDateTime(article.publishedAt)}
                </div>
              )}
            </div>

            {/* Title */}
            <h1
              className="font-mono mb-4 leading-snug"
              style={{
                color: '#c8d8c0',
                fontSize: '16px',
                lineHeight: '1.4',
              }}
            >
              {article.title}
            </h1>

            {/* Content */}
            <div
              className="font-mono text-sm leading-relaxed"
              style={{
                color: '#c8d8c0',
                fontSize: '13px',
                lineHeight: '1.7',
              }}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Open Source Link */}
            <div
              className="mt-6 pt-3"
              style={{ borderTop: '1px solid #1e3a2f' }}
            >
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono"
                style={{
                  color: '#00ff41',
                  letterSpacing: '0.1em',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLAnchorElement).style.textDecoration =
                    'underline')
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLAnchorElement).style.textDecoration = 'none')
                }
              >
                OPEN SOURCE &#8594;
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
