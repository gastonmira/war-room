import axios from 'axios';
import { MarketData } from '../../../contracts/api.types';

interface SymbolConfig {
  symbol: string;
  name: string;
  currency: string;
}

const SYMBOLS: SymbolConfig[] = [
  { symbol: 'CL=F', name: 'WTI Crude Oil', currency: 'USD' },
  { symbol: 'BZ=F', name: 'Brent Crude', currency: 'USD' },
  { symbol: 'GC=F', name: 'Gold', currency: 'USD' },
  { symbol: 'SPY', name: 'S&P 500', currency: 'USD' },
  { symbol: 'QQQ', name: 'Nasdaq', currency: 'USD' },
  { symbol: 'IRR=X', name: 'IRR/USD', currency: 'USD' },
];

// Store last known values to serve on partial failure
const lastKnown: Record<string, MarketData> = {};

async function fetchSymbol(config: SymbolConfig): Promise<MarketData> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(config.symbol)}?interval=1d`;
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const meta = response.data?.chart?.result?.[0]?.meta;
    if (!meta) throw new Error(`No meta for ${config.symbol}`);

    const price: number = meta.regularMarketPrice ?? 0;
    const prevClose: number = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change: number =
      meta.regularMarketChange !== 0 && meta.regularMarketChange != null
        ? (meta.regularMarketChange as number)
        : price - prevClose;
    const changePercent: number =
      meta.regularMarketChangePercent !== 0 && meta.regularMarketChangePercent != null
        ? (meta.regularMarketChangePercent as number)
        : prevClose !== 0 ? ((price - prevClose) / prevClose) * 100 : 0;

    const result: MarketData = {
      symbol: config.symbol,
      name: config.name,
      price,
      change,
      changePercent,
      currency: config.currency,
      updatedAt: new Date().toISOString(),
    };

    lastKnown[config.symbol] = result;
    return result;
  } catch (err) {
    console.warn(`[Markets] Failed to fetch ${config.symbol}:`, (err as Error).message);
    if (lastKnown[config.symbol]) {
      return lastKnown[config.symbol];
    }
    // Return zero-value fallback
    return {
      symbol: config.symbol,
      name: config.name,
      price: 0,
      change: 0,
      changePercent: 0,
      currency: config.currency,
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function fetchMarkets(): Promise<MarketData[]> {
  return Promise.all(SYMBOLS.map(fetchSymbol));
}
