import axios from 'axios';
import Parser from 'rss-parser';
import { NewsArticle } from '../../../contracts/api.types';

const RSS_FEEDS = [
  { url: 'https://feeds.reuters.com/reuters/topNews',       name: 'Reuters' },
  { url: 'http://feeds.bbci.co.uk/news/world/rss.xml',     name: 'BBC World' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml',      name: 'Al Jazeera' },
  { url: 'https://rsshub.app/ap/topics/apf-intlnews',      name: 'AP News' },
  { url: 'https://www.theguardian.com/world/rss',          name: 'The Guardian' },
];

function determineUrgency(publishedAt: string): 'breaking' | 'developing' | 'background' {
  const now = new Date();
  const published = new Date(publishedAt);
  const diffMs = now.getTime() - published.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return 'breaking';
  if (diffHours < 6) return 'developing';
  return 'background';
}

const MOCK_ARTICLES: NewsArticle[] = [
  {
    id: 'mock-1',
    title: 'US Imposes New Sanctions on Iranian Oil Exports',
    source: 'Reuters (Mock)',
    url: 'https://reuters.com',
    publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    summary: 'The United States Treasury Department announced a sweeping new round of sanctions targeting Iranian crude oil exports, affecting multiple shipping companies and tankers.',
    urgency: 'breaking',
    category: 'sanctions',
  },
  {
    id: 'mock-2',
    title: 'IAEA Report: Iran Continues Uranium Enrichment at Fordow',
    source: 'AP News (Mock)',
    url: 'https://apnews.com',
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    summary: 'The International Atomic Energy Agency confirmed in its latest report that Iran continues to enrich uranium at the underground Fordow facility at 60% purity.',
    urgency: 'developing',
    category: 'nuclear',
  },
  {
    id: 'mock-3',
    title: 'Strait of Hormuz Tensions Rise as IRGC Vessels Shadow US Ships',
    source: 'BBC (Mock)',
    url: 'https://bbc.com',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    summary: 'Iranian Revolutionary Guard Corps naval vessels conducted close-range maneuvers near US Navy destroyers in the Strait of Hormuz, raising regional tensions.',
    urgency: 'background',
    category: 'military',
  },
  {
    id: 'mock-4',
    title: 'Oil Prices Surge on Iran-US Diplomatic Breakdown',
    source: 'Financial Times (Mock)',
    url: 'https://ft.com',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    summary: 'Brent crude futures climbed above $90 per barrel after the collapse of indirect Iran-US nuclear negotiations in Vienna raised supply concerns.',
    urgency: 'background',
    category: 'markets',
  },
  {
    id: 'mock-5',
    title: 'European Powers Urge Restraint as Iran-US Standoff Deepens',
    source: 'The Guardian (Mock)',
    url: 'https://theguardian.com',
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    summary: 'France, Germany, and the UK issued a joint statement calling on both Tehran and Washington to return to diplomatic channels amid escalating rhetoric.',
    urgency: 'background',
    category: 'diplomacy',
  },
];

async function fetchFromNewsAPI(): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) throw new Error('NEWS_API_KEY not set');

  const from = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0];
  const url = `https://newsapi.org/v2/everything?q=(Iran+OR+IRGC)+AND+(US+OR+sanctions+OR+nuclear)&language=en&sortBy=publishedAt&pageSize=30&from=${from}&apiKey=${apiKey}`;
  const response = await axios.get(url, { timeout: 10000 });
  const articles = response.data.articles as Array<{
    url: string;
    title: string;
    source: { name: string };
    publishedAt: string;
    description: string | null;
    urlToImage: string | null;
  }>;

  return articles.map((a, i) => ({
    id: `newsapi-${i}-${Date.now()}`,
    title: a.title,
    source: a.source?.name || 'Unknown',
    sourceLogo: undefined,
    url: a.url,
    publishedAt: a.publishedAt,
    summary: a.description || '',
    urgency: determineUrgency(a.publishedAt),
    category: undefined,
  }));
}

async function fetchFromRSS(): Promise<NewsArticle[]> {
  const parser = new Parser();
  const results = await Promise.allSettled(
    RSS_FEEDS.map(feed => parser.parseURL(feed.url).then(parsed => ({ feed, parsed })))
  );

  const articles: NewsArticle[] = [];
  for (const result of results) {
    if (result.status === 'rejected') {
      console.warn('[News] RSS feed failed:', (result.reason as Error).message);
      continue;
    }
    const { feed, parsed } = result.value;
    for (let i = 0; i < parsed.items.length; i++) {
      const item = parsed.items[i];
      if (!item.title || !item.link) continue;
      const publishedAt = item.isoDate
        ? new Date(item.isoDate).toISOString()
        : new Date().toISOString();
      const summary = (item.contentSnippet || item.content || '').slice(0, 300);
      articles.push({
        id: `rss-${feed.name}-${i}-${Date.now()}`,
        title: item.title,
        source: feed.name,
        url: item.link,
        publishedAt,
        summary,
        urgency: determineUrgency(publishedAt),
        category: undefined,
      });
    }
  }
  return articles;
}

function areTitlesSimilar(a: string, b: string): boolean {
  const words = (s: string) =>
    new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3));
  const A = words(a), B = words(b);
  let intersection = 0;
  A.forEach(w => { if (B.has(w)) intersection++; });
  const union = new Set([...A, ...B]).size;
  return union > 0 && intersection / union > 0.5;
}

function deduplicateByTitle(articles: NewsArticle[]): NewsArticle[] {
  const kept: NewsArticle[] = [];
  for (const article of articles) {
    if (!kept.some(k => areTitlesSimilar(k.title, article.title))) {
      kept.push(article);
    }
  }
  return kept;
}

async function fetchFromGNews(): Promise<NewsArticle[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) throw new Error('GNEWS_API_KEY not set');

  const url = `https://gnews.io/api/v4/search?q=Iran+US&token=${apiKey}&lang=en`;
  const response = await axios.get(url, { timeout: 10000 });
  const articles = response.data.articles as Array<{
    url: string;
    title: string;
    source: { name: string };
    publishedAt: string;
    description: string | null;
    image: string | null;
  }>;

  return articles.map((a, i) => ({
    id: `gnews-${i}-${Date.now()}`,
    title: a.title,
    source: a.source?.name || 'Unknown',
    sourceLogo: undefined,
    url: a.url,
    publishedAt: a.publishedAt,
    summary: a.description || '',
    urgency: determineUrgency(a.publishedAt),
    category: undefined,
  }));
}

export async function fetchNews(): Promise<NewsArticle[]> {
  const [newsApiResult, rssResult] = await Promise.allSettled([
    fetchFromNewsAPI(),
    fetchFromRSS(),
  ]);

  const fromNewsApi = newsApiResult.status === 'fulfilled' ? newsApiResult.value : [];
  if (newsApiResult.status === 'rejected')
    console.warn('[News] NewsAPI failed:', (newsApiResult.reason as Error).message);

  const fromRss = rssResult.status === 'fulfilled' ? rssResult.value : [];
  if (rssResult.status === 'rejected')
    console.warn('[News] RSS fetch failed:', (rssResult.reason as Error).message);

  let merged = [...fromNewsApi, ...fromRss];

  // GNews fallback only when both primary sources return nothing
  if (merged.length === 0) {
    try {
      merged = await fetchFromGNews();
    } catch (e) {
      console.warn('[News] GNews fallback failed:', (e as Error).message);
    }
  }

  if (merged.length === 0) {
    console.info('[News] All sources failed, using mock data');
    return MOCK_ARTICLES;
  }

  merged.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return deduplicateByTitle(merged);
}
