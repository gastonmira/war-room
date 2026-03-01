import type { Metadata } from 'next';
import { Share_Tech_Mono } from 'next/font/google';
import './globals.css';
import { WarRoomProvider } from '../lib/context';
import UtcClock from '../components/UtcClock';

const shareTechMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-share-tech-mono',
});

export const metadata: Metadata = {
  title: 'OPERATION WAR ROOM',
  description: 'Military-grade real-time intelligence dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={shareTechMono.variable}>
      <body
        style={{
          fontFamily: 'var(--font-share-tech-mono), "Courier New", monospace',
          backgroundColor: '#0a0c0f',
          color: '#c8d8c0',
          margin: 0,
          padding: 0,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Scanline overlay effect */}
        <div className="scanline-overlay" />

        {/* Header Bar */}
        <header
          style={{
            backgroundColor: '#0f1318',
            borderBottom: '1px solid #1e3a2f',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          {/* Left: Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontFamily: 'inherit',
                fontSize: '14px',
                color: '#00ff41',
                letterSpacing: '0.15em',
                fontWeight: 'bold',
              }}
            >
              &#9889; OPERATION WAR ROOM
            </span>
            {/* LIVE indicator */}
            <span
              className="live-blink"
              style={{
                fontSize: '10px',
                fontFamily: 'inherit',
                color: '#ff0040',
                letterSpacing: '0.1em',
                border: '1px solid #ff0040',
                padding: '1px 5px',
              }}
            >
              LIVE
            </span>
          </div>

          {/* Center: UTC Clock */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UtcClock />
          </div>

          {/* Right: Threat Level */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'inherit',
                color: '#6b7f6b',
                letterSpacing: '0.08em',
              }}
            >
              STATUS:
            </span>
            <span
              className="animate-pulse"
              style={{
                fontSize: '11px',
                fontFamily: 'inherit',
                color: '#ff0040',
                letterSpacing: '0.1em',
                border: '1px solid #ff0040',
                padding: '2px 8px',
                backgroundColor: 'rgba(255,0,64,0.1)',
              }}
            >
              THREAT LEVEL: CRITICAL
            </span>
          </div>
        </header>

        {/* Main content */}
        <WarRoomProvider>
          <main style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
            {children}
          </main>
        </WarRoomProvider>
      </body>
    </html>
  );
}
