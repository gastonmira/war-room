# OPERATION WAR ROOM — Master Specification
> Classified Level: Internal Use Only  
> Version: 1.0  
> Stack: Next.js 14 + Node/Express + Google Cloud VPS

---

## 1. PROJECT OVERVIEW

**War Room** is a real-time intelligence dashboard monitoring the US–Iran geopolitical conflict. It aggregates news, social media signals, oil prices, and financial market data into a single military-style ops center interface.

The primary goals are:
1. Display live intelligence (news, tweets/X posts, markets) on a single screen
2. Allow inline article reading without leaving the dashboard
3. Serve as a **multi-agent Claude Code orchestration proof of concept** with 3 specialized agents working in parallel

---

## 2. MULTI-AGENT ARCHITECTURE

This project uses **3 Claude Code agents** with clearly defined ownership. The Orchestrator agent coordinates work and resolves conflicts. Frontend and Backend agents work in parallel on their respective domains.

```
┌─────────────────────────────────────┐
│         ORCHESTRATOR AGENT          │
│  - Reads this SPEC.md               │
│  - Spawns Frontend + Backend agents │
│  - Reviews PRs / resolves conflicts │
│  - Runs integration tests           │
│  - Manages deployment               │
└────────────┬──────────┬─────────────┘
             │          │
    ┌─────────▼──┐  ┌───▼──────────┐
    │  FRONTEND  │  │   BACKEND    │
    │   AGENT    │  │    AGENT     │
    │            │  │              │
    │ Next.js 14 │  │ Node/Express │
    │ React UI   │  │ REST + WS    │
    │ Military   │  │ Data fetcher │
    │ Design     │  │ Cache layer  │
    └────────────┘  └──────────────┘
```

### Communication Protocol Between Agents
- Shared contract defined in `/contracts/api.types.ts` (TypeScript interfaces)
- Frontend consumes Backend REST endpoints and WebSocket events
- Backend never touches UI code; Frontend never fetches external APIs directly
- When a conflict arises, Orchestrator edits the contract file and both agents adapt

---

## 3. MONOREPO STRUCTURE

```
warroom/
├── SPEC.md                    ← this file
├── CLAUDE.md                  ← Orchestrator instructions
├── contracts/
│   └── api.types.ts           ← shared TypeScript types (source of truth)
├── frontend/
│   ├── CLAUDE.md              ← Frontend agent instructions
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── app/               ← Next.js App Router
│       ├── components/
│       │   ├── layout/
│       │   ├── panels/
│       │   └── shared/
│       ├── hooks/
│       ├── lib/
│       └── styles/
├── backend/
│   ├── CLAUDE.md              ← Backend agent instructions
│   ├── package.json
│   └── src/
│       ├── index.ts           ← Express app entry
│       ├── routes/
│       ├── services/
│       │   ├── news.service.ts
│       │   ├── markets.service.ts
│       │   └── social.service.ts
│       ├── cache/
│       └── websocket/
├── deploy/
│   ├── nginx.conf
│   ├── docker-compose.yml
│   └── ecosystem.config.js    ← PM2 config
└── .env.example
```

---

## 4. FEATURES & PANELS

### 4.1 Dashboard Layout — "The Ops Center"

The UI is a **single-page dashboard** divided into tactical panels. No routing needed. Layout is fixed/grid-based to feel like a real ops center screen.

```
┌──────────────────────────────────────────────────────────────┐
│  ██ OPERATION WAR ROOM  [LIVE] [UTC TIME] [THREAT LEVEL: ██] │
├─────────────────────┬──────────────────┬─────────────────────┤
│                     │                  │                      │
│   INTEL FEED        │  ARTICLE VIEWER  │   MARKET WATCH       │
│   (News stream)     │  (inline reader) │   (Oil + Indices)    │
│                     │                  │                      │
│   - headline 1      │  [click to load  │   OIL: $XX.XX ▲      │
│   - headline 2      │   article here]  │   S&P: XXXX ▼        │
│   - headline 3      │                  │   Gold: XXXX ▲       │
│   ...               │                  │   IRR/USD: XXXX      │
│                     │                  │                      │
├─────────────────────┴──────────────────┴─────────────────────┤
│   SOCIAL SIGNALS                    │  THREAT TICKER          │
│   (X/Twitter posts about conflict)  │  (scrolling headlines)  │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Panel Descriptions

**INTEL FEED (News Panel)**
- Displays latest news articles related to US-Iran conflict
- Sources: NewsAPI (free tier), RSS feeds (Reuters, BBC, Al Jazeera, AP, Guardian), GNews API fallback
- Each item shows: source logo, headline, time ago, category tag
- Clicking a headline loads the article in the Article Viewer panel (no new tab)
- Auto-refreshes every 60 seconds
- Color-coded urgency: RED (breaking), AMBER (developing), GREEN (background)

**ARTICLE VIEWER**
- Center panel that loads article content when a headline is clicked
- Uses a backend proxy to fetch and parse article HTML (via `mercury-parser` or `@mozilla/readability`)
- Shows: title, source, publication time, full readable text, original URL
- Default state: classified/redacted placeholder graphic

**MARKET WATCH**
- Real-time (or near real-time) financial data:
  - Crude Oil (WTI & Brent) via Yahoo Finance API (free)
  - S&P 500, Nasdaq
  - Gold price
  - IRR/USD or relevant FX pairs
- Updates every 30 seconds
- Price change shown with directional arrows and color (green/red)

**SOCIAL SIGNALS**
- Curated search for relevant X/Twitter posts
- Since X API has high cost, use **Nitter RSS** as fallback (free, no auth needed)
- Search terms: `"Iran" "US" "IRGC" "sanctions" "nuclear" "Strait of Hormuz"`
- Display: avatar placeholder, handle, post text, timestamp
- Auto-refresh every 90 seconds

**THREAT TICKER**
- Bottom scrolling ticker bar with latest headlines (like a news channel)
- Also shows market data inline
- Updates in real-time via WebSocket

---

## 5. DATA SOURCES & APIs

| Data Type | Primary Source | Fallback | Auth Required |
|-----------|---------------|----------|---------------|
| News | NewsAPI.org + RSS (Reuters, BBC, Al Jazeera, AP, Guardian) | GNews API | API Key (NewsAPI only) |
| Article parsing | Backend proxy + Readability | None | No |
| Oil prices | Yahoo Finance (yfinance-like) | Alpha Vantage | No / API Key |
| Stock indices | Yahoo Finance | None | No |
| Gold | Yahoo Finance | None | No |
| Social | Nitter RSS | None | No |

**Free API endpoints to use:**
- `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}` — no auth
- `https://newsapi.org/v2/everything?q=Iran+US&apiKey={KEY}`
- Nitter RSS: `https://nitter.net/search/rss?q=Iran+US+conflict`
- Reuters RSS: `https://feeds.reuters.com/reuters/topNews`
- BBC World RSS: `http://feeds.bbci.co.uk/news/world/rss.xml`
- Al Jazeera RSS: `https://www.aljazeera.com/xml/rss/all.xml`
- AP News RSS: `https://rsshub.app/ap/topics/apf-intlnews`
- The Guardian RSS: `https://www.theguardian.com/world/rss`

**Backend is responsible for ALL external API calls.** Frontend only talks to the backend.

---

## 6. TECHNICAL REQUIREMENTS

### 6.1 Backend (Node/Express)

- TypeScript
- Express.js with CORS configured for frontend origin
- WebSocket server (using `ws` library) for real-time push to frontend
- Routes:
  - `GET /api/news` — returns latest news articles
  - `GET /api/markets` — returns market data
  - `GET /api/social` — returns social posts
  - `POST /api/article` — receives URL, returns parsed article content
- Caching layer: in-memory cache (node-cache) with TTL:
  - News: 60s
  - Markets: 30s
  - Social: 90s
- Background jobs: setInterval workers that refresh each data source and broadcast via WebSocket
- Error handling: if a source fails, serve cached data and log the failure
- Rate limiting: express-rate-limit on all routes

### 6.2 Frontend (Next.js 14)

- TypeScript
- App Router (not Pages Router)
- Tailwind CSS for styling
- No external UI component library — custom military-style components
- State management: React Context + useReducer (no Redux needed)
- WebSocket client: native browser WebSocket API in a custom hook `useWarRoomSocket`
- Responsive to 1920x1080 (primary target, desktop ops center)
- Mobile: graceful degradation, not primary focus

### 6.3 Military Design System

The UI must feel like a real military operations center. Key design tokens:

```
Background:     #0a0c0f (near black)
Surface:        #0f1318 (dark panel)
Border:         #1e3a2f (dark green)
Accent Green:   #00ff41 (matrix green - primary text/accents)
Accent Red:     #ff0040 (alerts, breaking news)
Accent Amber:   #ffaa00 (warnings, developing)
Text Primary:   #c8d8c0 (military green-white)
Text Secondary: #6b7f6b (muted green)
Font:           'Share Tech Mono' or 'Courier New' (monospace)
Grid lines:     subtle green grid overlay on panels
Scanline effect: subtle CSS scanline animation on panels
```

Visual elements to include:
- Panel headers styled as classified document tabs
- Blinking cursor indicators on live data
- "CLASSIFIED", "TOP SECRET" watermarks on the article viewer default state
- Coordinate/grid references in corners
- Uptime/connection status indicator in header
- Animated radar-sweep loading states

---

## 7. API CONTRACT

> This file lives in `/contracts/api.types.ts` and is the single source of truth for both agents.

```typescript
// contracts/api.types.ts

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
  updatedAt: string;
}

export interface SocialPost {
  id: string;
  handle: string;
  displayName: string;
  content: string;
  postedAt: string;
  url: string;
}

export interface ParsedArticle {
  title: string;
  content: string; // HTML or markdown
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

// WebSocket events
export type WsEventType = 'NEWS_UPDATE' | 'MARKETS_UPDATE' | 'SOCIAL_UPDATE' | 'TICKER_UPDATE';

export interface WsMessage {
  event: WsEventType;
  payload: NewsArticle[] | MarketData[] | SocialPost[];
  timestamp: string;
}
```

---

## 8. DEPLOYMENT (Google Cloud VPS)

```
Server: Google Cloud VPS (existing)
OS: Ubuntu
Process manager: PM2
Reverse proxy: Nginx
Ports:
  - 3000: Next.js frontend
  - 3001: Express backend
  - 80/443: Nginx (public-facing)
```

**Nginx config**: proxy `/api/*` and WebSocket to backend on :3001, everything else to frontend on :3000.

**PM2 ecosystem**:
```js
// ecosystem.config.js
module.exports = {
  apps: [
    { name: 'warroom-frontend', cwd: './frontend', script: 'npm', args: 'start', env: { PORT: 3000 } },
    { name: 'warroom-backend', cwd: './backend', script: 'npm', args: 'start', env: { PORT: 3001 } }
  ]
}
```

**Environment variables** (`.env.example`):
```
NEWS_API_KEY=your_key_here
FRONTEND_URL=http://your-vps-ip
BACKEND_URL=http://localhost:3001
NODE_ENV=production
```

---

## 9. DEVELOPMENT WORKFLOW FOR AGENTS

### Phase 1: Foundation (Orchestrator leads)
1. Create monorepo structure
2. Initialize `contracts/api.types.ts`
3. Set up both package.json files
4. Configure TypeScript in both apps

### Phase 2: Parallel development (Frontend + Backend simultaneously)
- **Backend agent**: implement all routes, services, caching, WebSocket
- **Frontend agent**: build layout, military design system, all panels with mock data

### Phase 3: Integration (Orchestrator coordinates)
1. Connect frontend WebSocket to backend
2. Replace frontend mock data with live API calls
3. End-to-end test all panels

### Phase 4: Deploy
1. Orchestrator runs deploy scripts on VPS
2. Configure PM2 + Nginx
3. Smoke test production

---

## 10. DEFINITION OF DONE

- [ ] All 5 panels render with live data
- [ ] Clicking a news headline loads article inline (no new tab)
- [ ] Market data refreshes every 30s without page reload
- [ ] WebSocket connection maintains live updates
- [ ] Military design system applied consistently
- [ ] Backend caching working (confirmed via `cached: true` in API responses)
- [ ] Deployed and accessible on VPS
- [ ] No hardcoded secrets (all via .env)
