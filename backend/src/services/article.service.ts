import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { ParsedArticle } from '../../../contracts/api.types';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function fetchArticle(url: string): Promise<ParsedArticle> {
  const fallback: ParsedArticle = {
    title: 'Unable to retrieve',
    content: '',
    source: new URL(url).hostname,
    url,
  };

  let html: string;
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      responseType: 'text',
      maxRedirects: 5,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
    html = response.data as string;
  } catch (err) {
    console.warn('[Article] Fetch failed:', (err as Error).message);
    return fallback;
  }

  try {
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    if (!article) return fallback;
    return {
      title: article.title || 'Untitled',
      content: article.content || '',
      author: article.byline || undefined,
      publishedAt: undefined,
      source: new URL(url).hostname,
      url,
    };
  } catch (err) {
    console.warn('[Article] Parse failed:', (err as Error).message);
    return fallback;
  }
}
