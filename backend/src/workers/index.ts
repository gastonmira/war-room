import { fetchNews } from '../services/news.service';
import { fetchMarkets } from '../services/markets.service';
import { fetchSocial } from '../services/social.service';
import cache, { CACHE_KEYS, TTL } from '../cache';
import { broadcast } from '../websocket';
import { WsMessage } from '../../../contracts/api.types';

async function runNewsWorker(): Promise<void> {
  try {
    console.log('[Worker] Fetching news...');
    const data = await fetchNews();
    cache.set(CACHE_KEYS.NEWS, data, TTL.NEWS);
    const message: WsMessage = {
      event: 'NEWS_UPDATE',
      payload: data,
      timestamp: new Date().toISOString(),
    };
    broadcast(message);
    console.log(`[Worker] News updated: ${data.length} articles`);
  } catch (err) {
    console.error('[Worker] News worker error:', (err as Error).message);
  }
}

async function runMarketsWorker(): Promise<void> {
  try {
    console.log('[Worker] Fetching markets...');
    const data = await fetchMarkets();
    cache.set(CACHE_KEYS.MARKETS, data, TTL.MARKETS);
    const message: WsMessage = {
      event: 'MARKETS_UPDATE',
      payload: data,
      timestamp: new Date().toISOString(),
    };
    broadcast(message);
    console.log(`[Worker] Markets updated: ${data.length} symbols`);
  } catch (err) {
    console.error('[Worker] Markets worker error:', (err as Error).message);
  }
}

async function runSocialWorker(): Promise<void> {
  try {
    console.log('[Worker] Fetching social...');
    const data = await fetchSocial();
    cache.set(CACHE_KEYS.SOCIAL, data, TTL.SOCIAL);
    const message: WsMessage = {
      event: 'SOCIAL_UPDATE',
      payload: data,
      timestamp: new Date().toISOString(),
    };
    broadcast(message);
    console.log(`[Worker] Social updated: ${data.length} posts`);
  } catch (err) {
    console.error('[Worker] Social worker error:', (err as Error).message);
  }
}

export function startWorkers(): void {
  console.log('[Workers] Starting all background workers...');

  // Run immediately on startup
  void runNewsWorker();
  void runMarketsWorker();
  void runSocialWorker();

  // Schedule recurring runs
  setInterval(() => { void runNewsWorker(); }, TTL.NEWS * 1000);
  setInterval(() => { void runMarketsWorker(); }, TTL.MARKETS * 1000);
  setInterval(() => { void runSocialWorker(); }, TTL.SOCIAL * 1000);

  console.log('[Workers] All workers scheduled');
}
