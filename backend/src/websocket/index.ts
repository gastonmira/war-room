import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { Duplex } from 'stream';
import { WsMessage } from '../../../contracts/api.types';
import cache from '../cache';
import { CACHE_KEYS } from '../cache';

export const wss = new WebSocketServer({ noServer: true });

const clients = new Set<WebSocket>();

function sendCurrentState(ws: WebSocket): void {
  const events: Array<{ key: string; event: WsMessage['event'] }> = [
    { key: CACHE_KEYS.NEWS, event: 'NEWS_UPDATE' },
    { key: CACHE_KEYS.MARKETS, event: 'MARKETS_UPDATE' },
    { key: CACHE_KEYS.SOCIAL, event: 'SOCIAL_UPDATE' },
  ];

  for (const { key, event } of events) {
    const data = cache.get(key);
    if (data) {
      const message: WsMessage = {
        event,
        payload: data as WsMessage['payload'],
        timestamp: new Date().toISOString(),
      };
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    }
  }
}

wss.on('connection', (ws: WebSocket) => {
  clients.add(ws);
  console.log(`[WS] Client connected. Total: ${clients.size}`);

  // Send current cached state immediately on connect
  sendCurrentState(ws);

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected. Total: ${clients.size}`);
  });

  ws.on('error', (err) => {
    console.error('[WS] Client error:', err.message);
    clients.delete(ws);
  });
});

export function broadcast(message: WsMessage): void {
  const payload = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

export function handleUpgrade(
  request: IncomingMessage,
  socket: Duplex,
  head: Buffer,
): void {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
}
