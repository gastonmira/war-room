# CLAUDE.md — Frontend Agent

## Your Role
You are the **Frontend Agent** for Operation War Room. You build the entire Next.js 14 frontend. You work in parallel with the Backend Agent. Your single point of contact with the backend is the contract in `/contracts/api.types.ts`.

## Your Domain
- Everything inside `./frontend/`
- You do NOT touch `./backend/` or `./contracts/` (read-only for you)

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS (custom military design system — see below)
- Native WebSocket API (no socket.io)
- React Context + useReducer for state

## Step-by-Step Build Order

### Step 1 — Design System (Tailwind config)
Extend `tailwind.config.js` with military color palette:
```js
colors: {
  ops: {
    bg: '#0a0c0f',
    surface: '#0f1318',
    border: '#1e3a2f',
    green: '#00ff41',
    red: '#ff0040',
    amber: '#ffaa00',
    text: '#c8d8c0',
    muted: '#6b7f6b',
  }
}
```
Add Google Font: `Share Tech Mono` (or fallback to Courier New).

### Step 2 — Global Layout (`app/layout.tsx`)
- Dark background, full viewport
- Import font
- Header bar with: "OPERATION WAR ROOM", blinking LIVE indicator, UTC clock, threat level badge

### Step 3 — Build Each Panel as a Component

**`components/panels/IntelFeed.tsx`** (News Panel - left column)
- Props: `articles: NewsArticle[]`, `onSelect: (article: NewsArticle) => void`
- Renders list of news items
- Each item renders an urgency label based on the `urgency` field:
  - `'breaking'` → blinking red badge with text **"⚡ BREAKING"** (use CSS `animate-pulse`)
  - `'developing'` → static amber badge with text **"▶ DEVELOPING"**
  - `'background'` → no badge, just a subtle green dot
- After the urgency badge: source name, headline, time ago
- Breaking news items should also have a red left-border accent (`border-l-2 border-ops-red`)
- Clicking calls `onSelect`
- Panel header: "// INTEL FEED" with refresh timestamp

**`components/panels/ArticleViewer.tsx`** (Center panel)
- Props: `article: ParsedArticle | null`, `loading: boolean`
- Default state: "CLASSIFIED" watermark with redacted text graphic
- When article loaded: title, source, date, full content (rendered as HTML)
- Has "OPEN SOURCE →" link to original URL
- Panel header: "// FIELD REPORT"

**`components/panels/MarketWatch.tsx`** (Right column - top)
- Props: `markets: MarketData[]`
- Renders each market: symbol, name, price, change arrow (▲/▼), change %
- Green for positive, red for negative
- Blinking dot on each price when fresh update received
- Panel header: "// MARKET INTELLIGENCE"
- Symbols to display: WTI, BRENT, XAUUSD, SPY, QQQ, IRR=X

**`components/panels/SocialSignals.tsx`** (Bottom left)
- Props: `posts: SocialPost[]`
- Renders social posts with handle, content, timestamp
- Scrollable, newest first
- Panel header: "// SIGNALS INTELLIGENCE (OSINT)"

**`components/panels/ThreatTicker.tsx`** (Bottom bar)
- Props: `headlines: string[]`
- CSS marquee/scroll animation with latest headlines + market data inline
- Always visible at bottom

### Step 4 — Custom Hook: `hooks/useWarRoomSocket.ts`
```typescript
// Connects to ws://localhost:3001 (or env var NEXT_PUBLIC_WS_URL)
// Listens for WsMessage events from /contracts/api.types.ts
// Returns: { news, markets, social, connected }
// On message: dispatch to Context
// Auto-reconnect on disconnect (exponential backoff, max 30s)
```

### Step 5 — Data Fetching
Use initial REST fetch on mount (SSR or client-side), then WebSocket for updates.

```typescript
// On mount: fetch /api/news, /api/markets, /api/social
// After: maintain via WebSocket updates
// Article fetch: POST /api/article { url: string }
```

During development (before backend is ready), use **mock data** that matches the contract types exactly. Put mocks in `lib/mocks.ts`.

### Step 6 — Page Assembly (`app/page.tsx`)
```
Grid layout:
- Left col (30%): IntelFeed
- Center col (40%): ArticleViewer  
- Right col (30%): MarketWatch (top) + SocialSignals (bottom)
- Full width bottom: ThreatTicker
```

## Military UI Rules
- All panel headers use monospace font, prefixed with `//`
- Panels have `1px solid ops-border` borders with subtle inner glow
- Add CSS `@keyframes scanline` subtle scan effect on panels
- Timestamps shown as relative ("2 MIN AGO") and absolute UTC
- Loading states: "ACQUIRING DATA..." with blinking cursor
- Errors: "SIGNAL LOST" in red
- No rounded corners anywhere — everything is sharp/angular
- Subtle green grid background texture on main bg

## Environment Variables
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## Definition of Done (Frontend)
- [ ] All 5 panels render with mock data
- [ ] WebSocket hook connects and updates panels in real-time
- [ ] Clicking a news item loads article in ArticleViewer (via API call)
- [ ] Military design system consistent across all panels
- [ ] UTC clock updates every second
- [ ] No TypeScript errors
- [ ] `npm run build` passes clean
