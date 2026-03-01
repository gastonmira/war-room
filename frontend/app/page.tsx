'use client';

// app/page.tsx
// Main War Room dashboard page — assembles all panels

import React, { useEffect } from 'react';
import { useWarRoom } from '../lib/context';
import { useWarRoomSocket } from '../hooks/useWarRoomSocket';
import IntelFeed from '../components/panels/IntelFeed';
import ArticleViewer from '../components/panels/ArticleViewer';
import MarketWatch from '../components/panels/MarketWatch';
import SocialSignals from '../components/panels/SocialSignals';
import ThreatTicker from '../components/panels/ThreatTicker';
import type { NewsArticle, ApiResponse, ParsedArticle } from '../lib/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function WarRoomPage() {
  const { state, dispatch } = useWarRoom();
  const { connected } = useWarRoomSocket();

  // Fetch initial data from backend on mount; fall back to mocks if unavailable
  useEffect(() => {
    async function fetchInitialData() {
      // Fetch news
      try {
        const res = await fetch(`${BACKEND_URL}/api/news`);
        if (res.ok) {
          const json: ApiResponse<NewsArticle[]> = await res.json();
          if (json.data && json.data.length > 0) {
            dispatch({ type: 'SET_NEWS', payload: json.data });
          }
        }
      } catch {
        // Backend not ready — mocks already in state from initialState
      }

      // Fetch markets
      try {
        const res = await fetch(`${BACKEND_URL}/api/markets`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            dispatch({ type: 'SET_MARKETS', payload: json.data });
          }
        }
      } catch {
        // Fall back to mocks
      }

      // Fetch social
      try {
        const res = await fetch(`${BACKEND_URL}/api/social`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            dispatch({ type: 'SET_SOCIAL', payload: json.data });
          }
        }
      } catch {
        // Fall back to mocks
      }
    }

    fetchInitialData();
  }, [dispatch]);

  // Handle article selection — POST to /api/article then display
  async function handleArticleSelect(article: NewsArticle) {
    // Clear the article first, then set loading (order matters — SET_ARTICLE also clears loading)
    dispatch({ type: 'SET_ARTICLE', payload: null });
    dispatch({ type: 'SET_ARTICLE_LOADING', payload: true });

    try {
      const res = await fetch(`${BACKEND_URL}/api/article`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: article.url }),
      });

      if (res.ok) {
        const json: ApiResponse<ParsedArticle> = await res.json();
        const data = json.data;
        if (!data.content) {
          data.content = `<p style="color:#c8d8c0">${article.summary}</p>
                          <p style="color:#6b7f6b;font-size:11px;margin-top:16px;">[PARSED CONTENT UNAVAILABLE — OPEN SOURCE LINK BELOW]</p>`;
        }
        dispatch({ type: 'SET_ARTICLE', payload: data });
      } else {
        throw new Error('Article fetch failed');
      }
    } catch {
      // Network or non-2xx: show summary as fallback
      const mockArticle: ParsedArticle = {
        title: article.title,
        content: `<p style="color:#c8d8c0">${article.summary}</p>
                  <p style="color:#6b7f6b;font-size:11px;margin-top:16px;">[FULL CONTENT UNAVAILABLE — OPEN SOURCE LINK BELOW]</p>`,
        source: article.source,
        url: article.url,
        publishedAt: article.publishedAt,
      };
      dispatch({ type: 'SET_ARTICLE', payload: mockArticle });
    }
  }

  // Extract headlines from breaking/developing news for the ticker
  const tickerHeadlines = state.news
    .filter((a) => a.urgency === 'breaking')
    .map((a) => `[${a.source}] ${a.title}`);

  // Add some static threat phrases if not enough headlines
  const fallbackHeadlines = [
    'MONITORING ALL ACTIVE THREAT VECTORS',
    'INTELLIGENCE SYSTEMS ONLINE',
    'COMMS ENCRYPTED — SECURE CHANNEL ACTIVE',
    'SIGINT COLLECTION IN PROGRESS',
  ];

  const allHeadlines = (
    tickerHeadlines.length >= 3
      ? tickerHeadlines
      : [...tickerHeadlines, ...fallbackHeadlines]
  ).slice(0, 30);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flex: 1,
      }}
    >
      {/* Connection status bar */}
      <div
        style={{
          backgroundColor: '#0f1318',
          borderBottom: '1px solid #1e3a2f',
          padding: '2px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '10px', color: '#6b7f6b', fontFamily: 'inherit' }}>
          WS:
        </span>
        <span
          style={{
            fontSize: '10px',
            color: connected ? '#00ff41' : '#ff0040',
            fontFamily: 'inherit',
            letterSpacing: '0.05em',
          }}
        >
          {connected ? '● CONNECTED' : '● SIGNAL LOST — RETRYING...'}
        </span>
        <span style={{ fontSize: '10px', color: '#1e3a2f', fontFamily: 'inherit' }}>|</span>
        <span style={{ fontSize: '10px', color: '#6b7f6b', fontFamily: 'inherit' }}>
          ARTICLES: {state.news.length} IN QUEUE
        </span>
        <span style={{ fontSize: '10px', color: '#1e3a2f', fontFamily: 'inherit' }}>|</span>
        <span style={{ fontSize: '10px', color: '#6b7f6b', fontFamily: 'inherit' }}>
          MARKETS: {state.markets.length} TRACKED
        </span>
      </div>

      {/* Main Grid */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '30% 40% 30%',
          gridTemplateRows: '1fr',
          gap: '1px',
          backgroundColor: '#1e3a2f',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Left Column — Intel Feed */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0a0c0f',
            overflow: 'hidden',
          }}
        >
          <IntelFeed
            articles={state.news}
            onSelect={handleArticleSelect}
          />
        </div>

        {/* Center Column — Article Viewer */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0a0c0f',
            overflow: 'hidden',
          }}
        >
          <ArticleViewer
            article={state.selectedArticle}
            loading={state.articleLoading}
          />
        </div>

        {/* Right Column — Market Watch + Social Signals */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0a0c0f',
            overflow: 'hidden',
            gap: '1px',
          }}
        >
          <div style={{ flex: '0 0 50%', overflow: 'hidden' }}>
            <MarketWatch markets={state.markets} />
          </div>
          <div style={{ flex: '0 0 50%', overflow: 'hidden' }}>
            <SocialSignals posts={state.social} />
          </div>
        </div>
      </div>

      {/* Bottom — Threat Ticker */}
      <ThreatTicker headlines={allHeadlines} markets={state.markets} />
    </div>
  );
}
