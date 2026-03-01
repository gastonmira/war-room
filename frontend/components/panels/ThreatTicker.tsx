'use client';

// components/panels/ThreatTicker.tsx
// Full-width bottom bar — scrolling threat/market ticker

import React from 'react';
import type { MarketData } from '../../lib/types';
import { formatPrice } from '../../lib/utils';

interface ThreatTickerProps {
  headlines: string[];
  markets?: MarketData[];
}

function MarketInline({ market }: { market: MarketData }) {
  const isUp = market.change >= 0;
  return (
    <span style={{ margin: '0 16px' }}>
      <span
        className="text-xs font-mono"
        style={{ color: '#6b7f6b', marginRight: '4px' }}
      >
        {market.symbol}
      </span>
      <span
        className="text-xs font-mono"
        style={{ color: '#c8d8c0', marginRight: '4px' }}
      >
        {formatPrice(market.price, market.currency)}
      </span>
      <span
        className="text-xs font-mono"
        style={{ color: isUp ? '#00ff41' : '#ff0040' }}
      >
        {isUp ? '▲' : '▼'} {Math.abs(market.changePercent).toFixed(2)}%
      </span>
      <span style={{ color: '#1e3a2f', margin: '0 8px' }}>|</span>
    </span>
  );
}

export default function ThreatTicker({ headlines, markets = [] }: ThreatTickerProps) {
  // Build the full ticker content — interleave headlines and market data
  const tickerItems: React.ReactNode[] = [];

  headlines.forEach((headline, i) => {
    tickerItems.push(
      <span key={`h-${i}`} style={{ margin: '0 16px', whiteSpace: 'nowrap' }}>
        <span style={{ color: '#ff0040', marginRight: '8px' }}>&#9889;</span>
        <span
          className="text-xs font-mono"
          style={{ color: '#c8d8c0', letterSpacing: '0.03em' }}
        >
          {headline.toUpperCase()}
        </span>
        <span style={{ color: '#1e3a2f', margin: '0 12px' }}>///</span>
      </span>
    );

    // Inject a market item after every 2 headlines
    if (markets.length > 0 && (i + 1) % 2 === 0) {
      const market = markets[Math.floor(i / 2) % markets.length];
      tickerItems.push(<MarketInline key={`m-${i}`} market={market} />);
    }
  });

  // Duplicate for seamless loop — add suffix to keys to ensure uniqueness
  const doubledItems = [
    ...tickerItems,
    ...headlines.map((headline, i) => {
      const items: React.ReactNode[] = [
        <span key={`h2-${i}`} style={{ margin: '0 16px', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#ff0040', marginRight: '8px' }}>&#9889;</span>
          <span className="text-xs font-mono" style={{ color: '#c8d8c0', letterSpacing: '0.03em' }}>
            {headline.toUpperCase()}
          </span>
          <span style={{ color: '#1e3a2f', margin: '0 12px' }}>///</span>
        </span>,
      ];
      if (markets.length > 0 && (i + 1) % 2 === 0) {
        const market = markets[Math.floor(i / 2) % markets.length];
        items.push(<MarketInline key={`m2-${i}`} market={market} />);
      }
      return items;
    }).flat(),
  ];

  return (
    <div
      style={{
        backgroundColor: '#0a0c0f',
        borderTop: '1px solid #1e3a2f',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Left label */}
      <div
        style={{
          flexShrink: 0,
          padding: '0 10px',
          borderRight: '1px solid #1e3a2f',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#0f1318',
          zIndex: 1,
        }}
      >
        <span
          className="text-xs font-mono animate-pulse"
          style={{ color: '#ff0040', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}
        >
          &#9889; THREAT FEED
        </span>
      </div>

      {/* Scrolling area */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <div className="animate-marquee" style={{ display: 'inline-flex', alignItems: 'center' }}>
          {doubledItems}
        </div>
      </div>
    </div>
  );
}
