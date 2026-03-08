'use client';

// components/panels/ConflictMap.tsx
// SSR-safe wrapper for the Leaflet conflict zone map panel

import dynamic from 'next/dynamic';
import type { WeatherData } from '../../lib/types';

interface Props {
  weather?: WeatherData[];
}

const ConflictMapInner = dynamic(
  () => import('./ConflictMapInner'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0c0f',
        }}
      >
        <span
          className="blink-cursor"
          style={{ fontSize: '11px', color: '#6b7f6b', letterSpacing: '0.08em' }}
        >
          ACQUIRING SATELLITE FEED...
        </span>
      </div>
    ),
  }
);

export default function ConflictMap({ weather = [] }: Props) {
  return (
    <div
      style={{
        flexShrink: 0,
        height: '240px',
        borderBottom: '2px solid #1e3a2f',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0, 255, 65, 0.05), inset 0 1px 0 rgba(0, 255, 65, 0.1)',
      }}
    >
      {/* Panel header */}
      <div
        style={{
          backgroundColor: '#0f1318',
          borderBottom: '1px solid #1e3a2f',
          padding: '3px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
          boxShadow: '0 2px 10px rgba(0, 255, 65, 0.05)',
        }}
      >
        <span style={{ fontSize: '10px', color: '#00ff41', letterSpacing: '0.1em' }}>
          // CONFLICT ZONE
        </span>
        <span style={{ fontSize: '10px', color: '#1e3a2f' }}>|</span>
        <span style={{ fontSize: '10px', color: '#6b7f6b', letterSpacing: '0.06em' }}>
          [MIDDLE EAST]
        </span>
      </div>

      {/* Map area */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ConflictMapInner weather={weather} />
      </div>
    </div>
  );
}
