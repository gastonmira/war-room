# CLAUDE.md — Backend Agent

## Your Role
You are the **Backend Agent** for Operation War Room. You build the entire Node/Express backend that feeds real-time data to the frontend. You work in parallel with the Frontend Agent. Your API contract lives in `/contracts/api.types.ts` — this is your single source of truth.

## Your Domain
- Everything inside `./backend/`
- You do NOT touch `./frontend/` or `./contracts/` (read-only for you)

## Stack
- Node.js + Express (TypeScript)
- `ws` library for WebSocket server
- `node-cache` for in-memory caching
- `axios` for external HTTP calls
- `@mozilla/readability` + `jsdom` for article parsing
- `express-rate-limit` for rate limiting
- `dotenv` for env vars

## Step-by-Step Build Order

### Step 1 — Project Setup
```bash
# tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}

# package.json scripts
"scripts": {
  "dev": "nodemon --exec ts-node src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

### Step 2 — Express App (`src/index.ts`)
- Initialize Express
- Apply CORS (allow frontend origin from env)
- Apply rate limiting (100 req/15min per IP)
- Mount routes under `/api`
- Create HTTP server + attach WebSocket server on same port (3001)
- Start background data refresh workers

### Step 3 — Routes

**`src/routes/news.ts`** → `GET /api/news`
- Returns `ApiResponse<NewsArticle[]>`
- Serves from cache if available

**`src/routes/markets.ts`** → `GET /api/markets`
- Returns `ApiResponse<MarketData[]>`

**`src/routes/social.ts`** → `GET /api/social`
- Returns `ApiResponse<SocialPost[]>`

**`src/routes/article.ts`** → `POST /api/article`
- Body: `{ url: string }`
- Fetches the URL, parses with Readability
- Returns `ApiResponse<ParsedArticle>`
- Timeout: 10 seconds
- Cache key: URL hash, TTL: 30 minutes

### Step 4 — Services

**`src/services/news.service.ts`**
```typescript
// Primary: NewsAPI.org
// GET https://newsapi.org/v2/everything
//   ?q=(Iran OR IRGC OR "Islamic Republic") AND (US OR sanctions OR nuclear OR "Strait of Hormuz")
//   &language=en&sortBy=publishedAt&pageSize=30
//   &apiKey=${NEWS_API_KEY}

// Map response to NewsArticle[] interface
// Determine urgency based on publication time:
//   - Published < 1h ago  → 'breaking'   (renders as "⚡ BREAKING" badge in UI)
//   - Published < 6h ago  → 'developing' (renders as "▶ DEVELOPING" badge in UI)
//   - Otherwise           → 'background' (no badge)

// Fallback if NewsAPI fails: use GNews
// GET https://gnews.io/api/v4/search?q=Iran+US&token=${GNEWS_API_KEY}&lang=en
```

**`src/services/markets.service.ts`**
```typescript
// Yahoo Finance API (no auth required)
// For each symbol, fetch:
// GET https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d

const SYMBOLS = [
  { symbol: 'CL=F', name: 'WTI Crude Oil', currency: 'USD' },
  { symbol: 'BZ=F', name: 'Brent Crude', currency: 'USD' },
  { symbol: 'GC=F', name: 'Gold', currency: 'USD' },
  { symbol: 'SPY', name: 'S&P 500', currency: 'USD' },
  { symbol: 'QQQ', name: 'Nasdaq', currency: 'USD' },
  { symbol: 'IRR=X', name: 'IRR/USD', currency: 'USD' },
];

// Map to MarketData[] interface
// Fetch all symbols in parallel with Promise.all
```

**`src/services/social.service.ts`**
```typescript
// Use Nitter RSS (no auth required)
// GET https://nitter.poast.org/search/rss?q=Iran+US+sanctions+nuclear&f=tweets

// Parse RSS XML with fast-xml-parser or rss-parser npm package
// Map to SocialPost[] interface
// Filter to last 50 posts

// Search queries to rotate through:
const QUERIES = [
  'Iran US sanctions',
  'IRGC nuclear deal',
  'Iran oil embargo',
  'Strait of Hormuz',
];
```

**`src/services/article.service.ts`**
```typescript
// Fetch URL with axios (10s timeout, desktop user-agent)
// Parse HTML with @mozilla/readability + jsdom
// Return ParsedArticle interface
// Strip all scripts, ads, nav elements
```

### Step 5 — Cache Layer (`src/cache/index.ts`)
```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache();

export const CACHE_KEYS = {
  NEWS: 'news_feed',
  MARKETS: 'market_data', 
  SOCIAL: 'social_posts',
};

export const TTL = {
  NEWS: 60,      // 60 seconds
  MARKETS: 30,   // 30 seconds
  SOCIAL: 90,    // 90 seconds
  ARTICLE: 1800, // 30 minutes
};
```

### Step 6 — WebSocket Server (`src/websocket/index.ts`)
```typescript
import { WebSocketServer, WebSocket } from 'ws';
import { WsMessage } from '../../contracts/api.types';

// Maintain set of connected clients
// On client connect: send current cached data immediately (all 3 types)
// Broadcast function: send WsMessage to all connected clients
// Export broadcast so workers can call it
```

### Step 7 — Background Workers (`src/workers/index.ts`)
```typescript
// Three independent setInterval workers:

// News worker: every 60s
//   1. Call news.service.fetchNews()
//   2. Update cache
//   3. Broadcast WsMessage { event: 'NEWS_UPDATE', payload: articles }

// Markets worker: every 30s
//   1. Call markets.service.fetchMarkets()
//   2. Update cache
//   3. Broadcast WsMessage { event: 'MARKETS_UPDATE', payload: markets }

// Social worker: every 90s
//   1. Call social.service.fetchSocial()
//   2. Update cache  
//   3. Broadcast WsMessage { event: 'SOCIAL_UPDATE', payload: posts }

// Run all workers immediately on startup (don't wait for first interval)
```

### Step 8 — Article Parser Route
```typescript
// POST /api/article
// - Validate URL (must be http/https)
// - Check cache first
// - Fetch + parse with Readability
// - Store in cache
// - Return ParsedArticle
// - On error: return 500 with error message (frontend shows "UNABLE TO RETRIEVE FIELD REPORT")
```

## Error Handling Rules
- All services must return null/empty array on failure (never throw uncaught)
- If a worker fails, log the error and serve stale cache
- If cache is empty and service fails: return `{ data: [], cached: false, error: "Source unavailable", updatedAt: "" }`
- Article parsing: if Readability fails, return just title + URL with empty content

## Environment Variables
```
PORT=3001
NEWS_API_KEY=
GNEWS_API_KEY=
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Definition of Done (Backend)
- [ ] All 4 REST routes respond correctly
- [ ] WebSocket broadcasts updates to connected clients
- [ ] All 3 background workers running and updating cache
- [ ] Article parsing works for major news sites (Reuters, BBC, AP)
- [ ] Caching working (second request returns `cached: true`)
- [ ] Rate limiting active
- [ ] Graceful error handling — never crashes on external API failure
- [ ] No TypeScript errors
- [ ] `npm run build` passes clean
