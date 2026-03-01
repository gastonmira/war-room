import Parser from 'rss-parser';
import { SocialPost } from '../../../contracts/api.types';

interface CustomItem {
  creator?: string;
  author?: string;
}

const parser = new Parser<Record<string, unknown>, CustomItem>({
  customFields: {
    item: ['creator', 'author'],
  },
});

const NITTER_INSTANCES = [
  'https://nitter.poast.org/search/rss?q=Iran+US+sanctions&f=tweets',
  'https://nitter.net/search/rss?q=Iran+sanctions&f=tweets',
];

const MOCK_POSTS: SocialPost[] = [
  {
    id: 'mock-social-1',
    handle: '@IranAnalyst',
    displayName: 'Iran Analyst',
    content: 'BREAKING: New round of US sanctions targeting Iranian petrochemical sector announced. Markets reacting. #Iran #Sanctions',
    postedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    url: 'https://twitter.com',
  },
  {
    id: 'mock-social-2',
    handle: '@MiddleEastEye',
    displayName: 'Middle East Eye',
    content: 'IRGC releases footage of naval exercises near Strait of Hormuz. Escalation or posturing? Analysis incoming.',
    postedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    url: 'https://twitter.com',
  },
  {
    id: 'mock-social-3',
    handle: '@OilPriceWatch',
    displayName: 'Oil Price Watch',
    content: 'WTI crude up 3.2% on Iran supply risk concerns. Watch $92 resistance level. #CrudeOil #OOTT',
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    url: 'https://twitter.com',
  },
];

type ParsedItem = CustomItem & Parser.Item;

function mapItemToPost(item: ParsedItem, index: number): SocialPost {
  const id = item.link || item.guid || `rss-${index}-${Date.now()}`;
  const handle = item.creator || item.author || '@unknown';
  const displayName = handle.replace(/^@/, '');
  const content = item.contentSnippet || item.content || item.title || '';
  const rawDate = item.isoDate || item.pubDate;
  const postedAt = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();
  const url = item.link || '';

  return { id, handle, displayName, content, postedAt, url };
}

export async function fetchSocial(): Promise<SocialPost[]> {
  for (const instanceUrl of NITTER_INSTANCES) {
    try {
      const feed = await parser.parseURL(instanceUrl);
      const items = feed.items.slice(0, 20);
      const posts = items.map((item, i) => mapItemToPost(item, i));
      posts.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
      return posts;
    } catch (err) {
      console.warn(`[Social] Failed to fetch from ${instanceUrl}:`, (err as Error).message);
    }
  }

  console.info('[Social] All Nitter instances failed, returning mock posts');
  return MOCK_POSTS;
}
