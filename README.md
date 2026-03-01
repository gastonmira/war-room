# ⚡ OPERATION WAR ROOM

Real-time military-style intelligence dashboard monitoring the US–Iran geopolitical conflict.

---

## Dashboard Layout — The Ops Center

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

---

## Features

- **5 panels**: Intel Feed, Article Viewer, Market Watch, Social Signals, Threat Ticker
- **News** from NewsAPI + RSS (BBC, Al Jazeera, Guardian) with GNews fallback
- **Market data**: WTI, Brent, Gold, S&P 500, Nasdaq, IRR/USD via Yahoo Finance (no auth)
- **Social signals** via Nitter RSS (no auth)
- **Inline article reader** powered by @mozilla/readability (no new tab)
- **Real-time push** via WebSocket — all panels update live
- **Urgency color-coding**: RED breaking / AMBER developing / GREEN background
- **Graceful fallbacks** at every layer down to mock data

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router), React 19, Tailwind CSS v4 |
| Backend | Node.js, Express 5, TypeScript |
| Real-time | WebSocket (`ws` library) |
| Data | axios, rss-parser, @mozilla/readability + jsdom |
| Cache | node-cache (in-memory, per-route TTL) |
| Deploy | PM2 + Nginx on Ubuntu VPS |

---

## Project Structure

```
warroom/
├── contracts/api.types.ts   ← shared TypeScript interfaces (source of truth)
├── frontend/                ← Next.js 14 app
│   ├── app/                 ← App Router (layout, page, globals.css)
│   ├── components/panels/   ← IntelFeed, ArticleViewer, MarketWatch, SocialSignals, ThreatTicker
│   ├── hooks/               ← useWarRoomSocket (WebSocket + auto-reconnect)
│   └── lib/                 ← context, types, mocks, utils
├── backend/
│   └── src/
│       ├── routes/          ← /api/news, /api/markets, /api/social, /api/article
│       ├── services/        ← news, markets, social, article fetchers
│       ├── cache/           ← NodeCache wrapper
│       ├── websocket/       ← WS server + broadcast
│       └── workers/         ← background refresh intervals
└── deploy/
    ├── ecosystem.config.js  ← PM2 config
    └── nginx.conf           ← reverse proxy
```

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Clone
git clone https://github.com/gastonmira/war-room.git && cd war-room

# Backend
cd backend && npm install
cp ../.env.example .env   # then fill in your keys
npm run dev

# Frontend (new terminal)
cd frontend && npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## Environment Variables

| Variable | File | Required | Description |
|----------|------|----------|-------------|
| `PORT` | `backend/.env` | No (default 3001) | Backend port |
| `NEWS_API_KEY` | `backend/.env` | No | newsapi.org key — RSS feeds work without it |
| `GNEWS_API_KEY` | `backend/.env` | No | GNews fallback only |
| `FRONTEND_URL` | `backend/.env` | Yes | CORS origin (e.g. http://localhost:3000) |
| `NEXT_PUBLIC_BACKEND_URL` | `frontend/.env.local` | Yes | REST base URL |
| `NEXT_PUBLIC_WS_URL` | `frontend/.env.local` | Yes | WebSocket URL |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/news` | Latest news articles (`NewsArticle[]`) |
| GET | `/api/markets` | Market prices (`MarketData[]`) |
| GET | `/api/social` | Social posts (`SocialPost[]`) |
| POST | `/api/article` | Parse article by URL (`ParsedArticle`) |

WebSocket events pushed to all clients: `NEWS_UPDATE`, `MARKETS_UPDATE`, `SOCIAL_UPDATE`

---

## Deployment (PM2 + Nginx)

```bash
npm run build --prefix frontend
npm run build --prefix backend
pm2 start deploy/ecosystem.config.js
sudo cp deploy/nginx.conf /etc/nginx/sites-available/warroom
sudo nginx -t && sudo systemctl reload nginx
```

---

## Architecture Note

Built as a multi-agent Claude Code project: an Orchestrator agent coordinated two parallel agents (Frontend and Backend) sharing a typed contract at `contracts/api.types.ts`.
