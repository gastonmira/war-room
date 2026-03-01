import { Router, Request, Response } from 'express';
import cache, { CACHE_KEYS } from '../cache';
import { fetchSocial } from '../services/social.service';
import { SocialPost, ApiResponse } from '../../../contracts/api.types';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const cached = cache.get<SocialPost[]>(CACHE_KEYS.SOCIAL);
  if (cached) {
    const response: ApiResponse<SocialPost[]> = {
      data: cached,
      cached: true,
      updatedAt: new Date().toISOString(),
    };
    return res.json(response);
  }

  try {
    const data = await fetchSocial();
    const response: ApiResponse<SocialPost[]> = {
      data,
      cached: false,
      updatedAt: new Date().toISOString(),
    };
    return res.json(response);
  } catch (err) {
    const response: ApiResponse<SocialPost[]> = {
      data: [],
      cached: false,
      updatedAt: '',
      error: 'Source unavailable',
    };
    return res.status(500).json(response);
  }
});

export default router;
