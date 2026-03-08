import { Router, Request, Response } from 'express';
import cache, { CACHE_KEYS, TTL } from '../cache';
import { fetchWeather } from '../services/weather.service';
import { WeatherData, ApiResponse } from '../../../contracts/api.types';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const cached = cache.get<WeatherData[]>(CACHE_KEYS.WEATHER);
  if (cached) {
    const response: ApiResponse<WeatherData[]> = {
      data: cached,
      cached: true,
      updatedAt: new Date().toISOString(),
    };
    return res.json(response);
  }

  try {
    const data = await fetchWeather();
    cache.set(CACHE_KEYS.WEATHER, data, TTL.WEATHER);
    const response: ApiResponse<WeatherData[]> = {
      data,
      cached: false,
      updatedAt: new Date().toISOString(),
    };
    return res.json(response);
  } catch (err) {
    const response: ApiResponse<WeatherData[]> = {
      data: [],
      cached: false,
      updatedAt: '',
      error: 'Weather source unavailable',
    };
    return res.status(500).json(response);
  }
});

export default router;
