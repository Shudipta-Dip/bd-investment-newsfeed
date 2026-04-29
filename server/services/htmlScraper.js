// ---------------------------------------------------------------------------
// HTML Fallback Scraper — for sites that don't have RSS feeds
// ---------------------------------------------------------------------------
// When rss-parser fails on a URL, this module fetches the raw HTML and
// extracts headline-like links using cheerio DOM parsing.

const cheerio = require('cheerio');

/**
 * Fetch a webpage and extract article-like links from it.
 * Returns an array of { title, link, contentSnippet, pubDate } objects.
 */
async function scrapeHTML(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
    });
    clearTimeout(timeout);
    
    if (!res.ok) return [];
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const items = [];
    const seen = new Set();
    
    // Strategy 1: Look for <article> tags (most modern news sites)
    $('article a, .article a, .story a, .post a, .news-item a, .card a').each((i, el) => {
      extractHeadline($, el, url, items, seen);
    });
    
    // Strategy 2: Look for headline-class elements
    $('h1 a, h2 a, h3 a, h4 a, [class*="headline"] a, [class*="title"] a, [class*="story"] a').each((i, el) => {
      extractHeadline($, el, url, items, seen);
    });
    
    // Strategy 3: Broad scan — any link with substantial text
    if (items.length < 5) {
      $('a').each((i, el) => {
        extractHeadline($, el, url, items, seen);
      });
    }
    
    return items;
  } catch (err) {
    return [];
  }
}

function extractHeadline($, el, baseUrl, items, seen) {
  const title = $(el).text().trim().replace(/\s+/g, ' ');
  let link = $(el).attr('href');
  
  if (!link || !title) return;
  
  // Filter: title must be at least 5 words (headline-like)
  const wordCount = title.split(/\s+/).length;
  if (wordCount < 5 || wordCount > 30) return;
  
  // Filter: skip nav/footer links
  const lower = title.toLowerCase();
  if (['subscribe', 'sign in', 'log in', 'contact', 'about us', 'privacy',
       'terms', 'cookie', 'menu', 'home', 'search', 'more stories',
       'read more', 'see all', 'load more', 'advertisement'].some(s => lower.includes(s))) return;
  
  // Resolve relative URLs
  if (link.startsWith('/')) {
    try { link = new URL(link, baseUrl).href; } catch { return; }
  } else if (!link.startsWith('http')) {
    return;
  }
  
  // Deduplicate
  const key = title.substring(0, 50);
  if (seen.has(key) || seen.has(link)) return;
  seen.add(key);
  seen.add(link);
  
  items.push({
    title,
    link,
    contentSnippet: '',
    pubDate: null, // HTML pages rarely expose dates in a parseable way
  });
}

module.exports = { scrapeHTML };
