import NodeCache from 'node-cache';

const cache = new NodeCache();

export const CACHE_KEYS = {
  NEWS: 'news_feed',
  MARKETS: 'market_data',
  SOCIAL: 'social_posts',
};

export const TTL = {
  NEWS: 60,
  MARKETS: 30,
  SOCIAL: 90,
  ARTICLE: 1800,
};

export default cache;
