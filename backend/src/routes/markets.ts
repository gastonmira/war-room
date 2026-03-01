import { Router, Request, Response } from 'express';
import cache, { CACHE_KEYS } from '../cache';
import { fetchMarkets } from '../services/markets.service';
import { MarketData, ApiResponse } from '../../../contracts/api.types';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const cached = cache.get<MarketData[]>(CACHE_KEYS.MARKETS);
  if (cached) {
    const response: ApiResponse<MarketData[]> = {
      data: cached,
      cached: true,
      updatedAt: new Date().toISOString(),
    };
    return res.json(response);
  }

  try {
    const data = await fetchMarkets();
    const response: ApiResponse<MarketData[]> = {
      data,
      cached: false,
      updatedAt: new Date().toISOString(),
    };
    return res.json(response);
  } catch (err) {
    const response: ApiResponse<MarketData[]> = {
      data: [],
      cached: false,
      updatedAt: '',
      error: 'Source unavailable',
    };
    return res.status(500).json(response);
  }
});

export default router;
