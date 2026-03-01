import { Router, Request, Response } from 'express';
import cache, { TTL } from '../cache';
import { fetchArticle } from '../services/article.service';
import { ParsedArticle, ApiResponse } from '../../../contracts/api.types';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { url } = req.body as { url?: string };

  if (!url || typeof url !== 'string') {
    const response: ApiResponse<null> = {
      data: null,
      cached: false,
      updatedAt: '',
      error: 'Missing or invalid url field in request body',
    };
    return res.status(400).json(response);
  }

  // Validate URL scheme
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Invalid protocol');
    }
  } catch {
    const response: ApiResponse<null> = {
      data: null,
      cached: false,
      updatedAt: '',
      error: 'URL must be a valid http or https URL',
    };
    return res.status(400).json(response);
  }

  const cacheKey = `article:${url}`;
  const cached = cache.get<ParsedArticle>(cacheKey);
  if (cached) {
    const response: ApiResponse<ParsedArticle> = {
      data: cached,
      cached: true,
      updatedAt: new Date().toISOString(),
    };
    return res.json(response);
  }

  try {
    const article = await fetchArticle(url);
    cache.set(cacheKey, article, TTL.ARTICLE);
    const response: ApiResponse<ParsedArticle> = {
      data: article,
      cached: false,
      updatedAt: new Date().toISOString(),
    };
    return res.json(response);
  } catch (err) {
    const response: ApiResponse<null> = {
      data: null,
      cached: false,
      updatedAt: '',
      error: 'Failed to parse article',
    };
    return res.status(500).json(response);
  }
});

export default router;
