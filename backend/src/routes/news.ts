import { Router, Request, Response } from 'express';
import cache, { CACHE_KEYS, TTL } from '../cache';
import { fetchNews } from '../services/news.service';
import { NewsArticle, ApiResponse } from '../../../contracts/api.types';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const cached = cache.get<NewsArticle[]>(CACHE_KEYS.NEWS);
  if (cached) {
    const response: ApiResponse<NewsArticle[]> = {
      data: cached,
      cached: true,
      updatedAt: new Date().toISOString(),
    };
    return res.json(response);
  }

  try {
    const data = await fetchNews();
    cache.set(CACHE_KEYS.NEWS, data, TTL.NEWS);
    const response: ApiResponse<NewsArticle[]> = {
      data,
      cached: false,
      updatedAt: new Date().toISOString(),
    };
    return res.json(response);
  } catch (err) {
    const response: ApiResponse<NewsArticle[]> = {
      data: [],
      cached: false,
      updatedAt: '',
      error: 'Source unavailable',
    };
    return res.status(500).json(response);
  }
});

export default router;
