'use client';

// components/panels/MarketWatch.tsx
// Right column top — displays live market data with directional indicators

import React, { useState, useEffect, useRef } from 'react';
import type { MarketData } from '../../lib/types';
import { formatPrice } from '../../lib/utils';

interface MarketWatchProps {
  markets: MarketData[];
}

export default function MarketWatch({ markets }: MarketWatchProps) {
  const [flashSet, setFlashSet] = useState<Set<string>>(new Set());
  const prevMarketsRef = useRef<MarketData[]>(markets);

  useEffect(() => {
    const changed = new Set<string>();
    markets.forEach((m) => {
      const prev = prevMarketsRef.current.find((p) => p.symbol === m.symbol);
      if (prev && prev.price !== m.price) {
        changed.add(m.symbol);
      }
    });
    prevMarketsRef.current = markets;
    if (changed.size === 0) return;
    setFlashSet(changed);
    const t = setTimeout(() => setFlashSet(new Set()), 1500);
    return () => clearTimeout(t);
  }, [markets]);

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
          // MARKET INTELLIGENCE
        </span>
        <span className="text-xs font-mono animate-pulse" style={{ color: '#ff0040' }}>
          LIVE
        </span>
      </div>

      {/* Market Rows */}
      <div className="flex-1 overflow-y-auto">
        {markets.map((market) => {
          const isUp = market.change >= 0;
          const isFlashing = flashSet.has(market.symbol);

          return (
            <div
              key={market.symbol}
              className="flex items-center justify-between px-3 py-2"
              style={{
                borderBottom: '1px solid #1e3a2f',
                backgroundColor: isFlashing
                  ? 'rgba(0,255,65,0.06)'
                  : 'transparent',
                transition: 'background-color 0.3s',
              }}
            >
              {/* Left: Symbol + Name */}
              <div className="flex flex-col">
                <span
                  className="text-xs font-mono"
                  style={{
                    color: '#00ff41',
                    letterSpacing: '0.08em',
                    fontWeight: 'bold',
                  }}
                >
                  {market.symbol}
                </span>
                <span
                  className="font-mono"
                  style={{ color: '#6b7f6b', fontSize: '10px' }}
                >
                  {market.name}
                </span>
              </div>

              {/* Right: Price + Change */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  {/* Live blink dot */}
                  <span
                    className="live-blink"
                    style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#00ff41',
                      display: 'inline-block',
                      borderRadius: '0',
                    }}
                  />
                  <span
                    className="text-sm font-mono"
                    style={{
                      color: '#c8d8c0',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {formatPrice(market.price, market.currency)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className="text-xs font-mono"
                    style={{ color: isUp ? '#00ff41' : '#ff0040' }}
                  >
                    {isUp ? '▲' : '▼'} {Math.abs(market.changePercent).toFixed(2)}%
                  </span>
                  <span
                    className="text-xs font-mono"
                    style={{ color: isUp ? '#00ff41' : '#ff0040', opacity: 0.7 }}
                  >
                    ({isUp ? '+' : ''}{market.change.toFixed(2)})
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
