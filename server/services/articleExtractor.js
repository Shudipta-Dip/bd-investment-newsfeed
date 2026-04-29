// ---------------------------------------------------------------------------
// Article Text Extractor — fetches full article body from a URL
// ---------------------------------------------------------------------------
// Used for "Deep Dive" analysis on global articles. Extracts the main
// body text from a news article page using Mozilla's Readability algorithm
// (the same engine behind Firefox/Safari "Reader View").
//
// REVERT: If this version causes issues, replace this file with
//         articleExtractor.backup.js (the original Cheerio-based extractor).

const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');

const USER_AGENTS = [
  // Try regular browser first (most sites accept this)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  // Fallback: Googlebot (helps bypass soft paywalls on financial sites)
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
];

/**
 * Attempt to fetch HTML from a URL with a specific user agent.
 */
async function fetchHTML(url, userAgent, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
    clearTimeout(timer);
    if (!response.ok) return null;
    return await response.text();
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Run Mozilla Readability on raw HTML.
 * @returns {string} Clean article text, or empty string.
 */
function parseWithReadability(html, url) {
  try {
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (article && article.textContent && article.textContent.trim().length > 200) {
      return article.textContent
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]{2,}/g, ' ')
        .trim();
    }
  } catch {
    // Readability parse error — fall through to Cheerio
  }
  return '';
}

/**
 * Cheerio fallback — for when Readability can't parse the page.
 */
function parseWithCheerio(html) {
  try {
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);

    $('script, style, nav, header, footer, aside, form, iframe, noscript, .ad, .ads, .advertisement, .sidebar, .menu, .nav, .social-share, .related-articles, .comments').remove();

    const articleSelectors = [
      'article', '.article-body', '.article-content', '.post-content',
      '.entry-content', '.story-body', '.field-body', '[itemprop="articleBody"]',
      '.content-area', '.main-content', '.story-content',
    ];

    let bestText = '';
    for (const selector of articleSelectors) {
      const el = $(selector);
      if (el.length > 0) {
        const text = el.find('p').map((_, p) => $(p).text().trim()).get().join(' ');
        if (text.length > bestText.length) bestText = text;
      }
    }

    if (bestText.length < 200) {
      bestText = $('p')
        .map((_, p) => $(p).text().trim())
        .get()
        .filter(t => t.length > 40)
        .join(' ');
    }

    return bestText.trim();
  } catch {
    return '';
  }
}

/**
 * Fetch and extract the main body text from a news article URL.
 * Tries multiple user agents and parsing strategies for maximum coverage.
 *
 * @param {string} url - The article URL
 * @param {number} timeoutMs - Fetch timeout per attempt in ms (default 8000)
 * @returns {string} The extracted article text (up to ~10,000 chars)
 */
async function extractArticleText(url, timeoutMs = 8000) {
  for (const ua of USER_AGENTS) {
    const html = await fetchHTML(url, ua, timeoutMs);
    if (!html) continue;

    // Try Readability first
    let text = parseWithReadability(html, url);
    if (text.length > 200) return text.slice(0, 10000);

    // Fall back to Cheerio
    text = parseWithCheerio(html);
    if (text.length > 200) return text.slice(0, 10000);
  }

  // All attempts failed
  return '';
}

module.exports = { extractArticleText };
