'use client';

// hooks/useWarRoomSocket.ts
// WebSocket hook with auto-reconnect and exponential backoff

import { useEffect, useRef } from 'react';
import { useWarRoom } from '../lib/context';
import type { WsMessage, NewsArticle, MarketData, SocialPost } from '../lib/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
const MAX_BACKOFF_MS = 30_000;

export function useWarRoomSocket(): { connected: boolean } {
  const { state, dispatch } = useWarRoom();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef<number>(0);
  const mountedRef = useRef<boolean>(true);
  // Keep a stable ref to dispatch to avoid stale closures
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  useEffect(() => {
    mountedRef.current = true;

    function scheduleReconnect() {
      if (!mountedRef.current) return;
      const attempt = attemptRef.current;
      const backoff = Math.min(1000 * Math.pow(2, attempt), MAX_BACKOFF_MS);
      attemptRef.current = attempt + 1;
      reconnectTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          connect();
        }
      }, backoff);
    }

    function connect() {
      if (!mountedRef.current) return;

      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!mountedRef.current) return;
          attemptRef.current = 0;
          dispatchRef.current({ type: 'SET_CONNECTED', payload: true });
        };

        ws.onmessage = (event: MessageEvent) => {
          if (!mountedRef.current) return;
          try {
            const msg: WsMessage = JSON.parse(event.data as string);

            switch (msg.event) {
              case 'NEWS_UPDATE':
                dispatchRef.current({
                  type: 'SET_NEWS',
                  payload: msg.payload as NewsArticle[],
                });
                break;
              case 'MARKETS_UPDATE':
                dispatchRef.current({
                  type: 'SET_MARKETS',
                  payload: msg.payload as MarketData[],
                });
                break;
              case 'SOCIAL_UPDATE':
                dispatchRef.current({
                  type: 'SET_SOCIAL',
                  payload: msg.payload as SocialPost[],
                });
                break;
              case 'TICKER_UPDATE':
                // Handled via news state in ThreatTicker
                break;
              default:
                break;
            }
          } catch {
            // Ignore malformed messages
          }
        };

        ws.onclose = () => {
          if (!mountedRef.current) return;
          dispatchRef.current({ type: 'SET_CONNECTED', payload: false });
          scheduleReconnect();
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        scheduleReconnect();
      }
    }

    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { connected: state.connected };
}
