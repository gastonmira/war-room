// lib/mocks.ts
// Mock data matching contract types exactly — used before backend is ready

import type { NewsArticle, MarketData, SocialPost } from './types';

export const mockNews: NewsArticle[] = [
  {
    id: 'news-001',
    title: 'Missile Strike Reported Near Strategic Naval Base — Multiple Sources Confirm',
    source: 'Reuters',
    url: 'https://reuters.com/world/breaking-001',
    publishedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    summary:
      'Multiple independent sources confirm a missile strike in the vicinity of a strategic naval installation. Emergency protocols activated. Regional air defense systems engaged.',
    urgency: 'breaking',
    category: 'MILITARY',
  },
  {
    id: 'news-002',
    title: 'Emergency UN Security Council Session Called — Sanctions Vote Imminent',
    source: 'AP',
    url: 'https://apnews.com/world/un-security-002',
    publishedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    summary:
      'The United Nations Security Council has been convened for an emergency session. A vote on expanded economic sanctions is expected within hours.',
    urgency: 'breaking',
    category: 'DIPLOMACY',
  },
  {
    id: 'news-003',
    title: 'Cyber Attack Disrupts Power Grid in Eastern Region — Government Confirms',
    source: 'BBC',
    url: 'https://bbc.com/news/cyber-003',
    publishedAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    summary:
      'Officials confirmed a sophisticated cyberattack targeting critical infrastructure. Backup power systems activated. Investigation ongoing with allied intelligence agencies.',
    urgency: 'developing',
    category: 'CYBER',
  },
  {
    id: 'news-004',
    title: 'Oil Tanker Routes Diverted Through Red Sea Amid Security Concerns',
    source: 'Bloomberg',
    url: 'https://bloomberg.com/markets/tanker-004',
    publishedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    summary:
      'Major shipping companies have begun rerouting tanker traffic following increased threat assessments. Insurance rates spike 340% as Lloyd\'s raises risk ratings.',
    urgency: 'developing',
    category: 'ECONOMIC',
  },
  {
    id: 'news-005',
    title: 'NATO Activates Rapid Response Force — Article 4 Consultations Begin',
    source: 'Defense News',
    url: 'https://defensenews.com/nato-005',
    publishedAt: new Date(Date.now() - 67 * 60 * 1000).toISOString(),
    summary:
      'Alliance defense ministers convening in Brussels as NATO activates its Very High Readiness Joint Task Force. Article 4 consultations initiated by three member states.',
    urgency: 'developing',
    category: 'MILITARY',
  },
  {
    id: 'news-006',
    title: 'Central Bank Emergency Rate Decision Expected Amid Market Volatility',
    source: 'Financial Times',
    url: 'https://ft.com/finance/cb-006',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    summary:
      'The Federal Reserve is reportedly preparing an emergency rate announcement following extraordinary market volatility. Gold and treasury bonds surge as risk assets fall.',
    urgency: 'background',
    category: 'ECONOMIC',
  },
  {
    id: 'news-007',
    title: 'Satellite Imagery Analysis: Troop Buildup Continues Along Northern Border',
    source: 'ISW',
    url: 'https://understandingwar.org/analysis-007',
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    summary:
      'Commercial satellite imagery reviewed by ISW analysts shows continued force aggregation at three staging areas. Estimated 40,000 personnel within 80km of border crossing points.',
    urgency: 'background',
    category: 'INTELLIGENCE',
  },
  {
    id: 'news-008',
    title: 'Diplomatic Back-Channel Negotiations Reportedly Stalled — Sources',
    source: 'Al Jazeera',
    url: 'https://aljazeera.com/diplomacy-008',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    summary:
      'Confidential back-channel talks mediated by a neutral third party have reportedly broken down following a precondition dispute. Next steps unclear as deadline approaches.',
    urgency: 'background',
    category: 'DIPLOMACY',
  },
];

export const mockMarkets: MarketData[] = [
  {
    symbol: 'WTI',
    name: 'WTI Crude Oil',
    price: 94.78,
    change: 6.23,
    changePercent: 7.04,
    currency: 'USD',
    updatedAt: new Date(Date.now() - 30 * 1000).toISOString(),
  },
  {
    symbol: 'BRENT',
    name: 'Brent Crude',
    price: 97.41,
    change: 5.89,
    changePercent: 6.43,
    currency: 'USD',
    updatedAt: new Date(Date.now() - 30 * 1000).toISOString(),
  },
  {
    symbol: 'XAUUSD',
    name: 'Gold Spot',
    price: 2387.50,
    change: 84.20,
    changePercent: 3.66,
    currency: 'USD',
    updatedAt: new Date(Date.now() - 45 * 1000).toISOString(),
  },
  {
    symbol: 'SPY',
    name: 'S&P 500',
    price: 4812.30,
    change: -223.14,
    changePercent: -4.43,
    currency: 'USD',
    updatedAt: new Date(Date.now() - 60 * 1000).toISOString(),
  },
  {
    symbol: 'QQQ',
    name: 'Nasdaq 100',
    price: 16543.20,
    change: -892.30,
    changePercent: -5.12,
    currency: 'USD',
    updatedAt: new Date(Date.now() - 60 * 1000).toISOString(),
  },
  {
    symbol: 'IRR=X',
    name: 'IRR/USD',
    price: 42150.00,
    change: 1230.00,
    changePercent: 3.01,
    currency: 'IRR',
    updatedAt: new Date(Date.now() - 90 * 1000).toISOString(),
  },
];

export const mockSocial: SocialPost[] = [
  {
    id: 'social-001',
    handle: '@IntelAnalyst_X',
    displayName: 'OSINT Analyst',
    content:
      'SIGINT intercepts suggest unusual comms traffic in sector 7. Encrypted bursts on mil-band frequencies. Could be pre-operation comms. Watch this space. #OSINT #Geopolitics',
    postedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    url: 'https://twitter.com/IntelAnalyst_X/status/001',
  },
  {
    id: 'social-002',
    handle: '@WarMonitor_Live',
    displayName: 'War Monitor',
    content:
      'Multiple unverified reports of explosions near [REDACTED]. Local media blackout in effect. Satellite revisit scheduled in 4hrs. Stand by for imagery update.',
    postedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    url: 'https://twitter.com/WarMonitor_Live/status/002',
  },
  {
    id: 'social-003',
    handle: '@GeoConfirmed',
    displayName: 'GeoConfirmed',
    content:
      'GEOLOCATED: Video from 3hrs ago confirms position 34.7°N 48.5°E. Matching terrain features: ridge line, transmission tower, highway overpass. Accuracy: HIGH.',
    postedAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    url: 'https://twitter.com/GeoConfirmed/status/003',
  },
  {
    id: 'social-004',
    handle: '@MarketCrisisAlert',
    displayName: 'Crisis Markets',
    content:
      'Gold futures circuit breaker triggered for second time today. VIX above 42. Options market pricing in 15% SPX move this week. Structural hedging demand surging.',
    postedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    url: 'https://twitter.com/MarketCrisisAlert/status/004',
  },
  {
    id: 'social-005',
    handle: '@DiplomacyWatch',
    displayName: 'Diplomacy Watch',
    content:
      'Ambassador recalled for "urgent consultations." Third diplomatic expulsion this month. Back-channel is dead. We are in uncharted territory diplomatically.',
    postedAt: new Date(Date.now() - 58 * 60 * 1000).toISOString(),
    url: 'https://twitter.com/DiplomacyWatch/status/005',
  },
];
