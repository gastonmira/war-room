// contracts/api.types.ts
// ⚠️  SOURCE OF TRUTH — Do not edit without Orchestrator approval
// Both Frontend and Backend agents depend on these interfaces

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  sourceLogo?: string;
  url: string;
  publishedAt: string; // ISO 8601
  summary: string;
  urgency: 'breaking' | 'developing' | 'background';
  category?: string;
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  updatedAt: string; // ISO 8601
}

export interface SocialPost {
  id: string;
  handle: string;
  displayName: string;
  content: string;
  postedAt: string; // ISO 8601
  url: string;
}

export interface ParsedArticle {
  title: string;
  content: string; // HTML string, sanitized
  author?: string;
  publishedAt?: string;
  source: string;
  url: string;
}

// REST Response wrappers
export interface ApiResponse<T> {
  data: T;
  cached: boolean;
  updatedAt: string;
  error?: string;
}

// WebSocket event types
export type WsEventType =
  | 'NEWS_UPDATE'
  | 'MARKETS_UPDATE'
  | 'SOCIAL_UPDATE'
  | 'TICKER_UPDATE';

export interface WsMessage {
  event: WsEventType;
  payload: NewsArticle[] | MarketData[] | SocialPost[];
  timestamp: string; // ISO 8601
}
