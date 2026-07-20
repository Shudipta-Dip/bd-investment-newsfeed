// ---------------------------------------------------------------------------
// RSS Scraper — fetches articles from international news sources
// ---------------------------------------------------------------------------
// This is the engine. It:
//   1. Reads RSS feeds from the curated source list
//   2. Filters articles for Bangladesh relevance
//   3. Tags sentiment (critical / growth / policy)
//   4. Saves new articles to Supabase (skips duplicates via URL)

const RSSParser = require('rss-parser');
const sources = require('./sources');
const { isRelevant, tagSentiment, scoreImpact } = require('./analyzer');
const { createManyArticles } = require('../models');
const { scrapeHTML } = require('./htmlScraper');
const { validateBatch, deepDiveGlobalArticles, generateLocalRationale } = require('./aiValidator');

const parser = new RSSParser({
  timeout: 4000, // Reduced to 4s for faster fail-fast on invalid sources
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
  },
});

/**
 * Safely parse a date string and return an ISO string.
 * Falls back to current time if missing or invalid.
 */
function parseSafeDate(dateStr) {
  if (!dateStr) return new Date().toISOString();
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
}

/**
 * Clean URL of tracking parameters to ensure reliable deduplication.
 */
function cleanUrl(urlStr) {
  if (!urlStr) return '';
  try {
    const url = new URL(urlStr.trim());
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'ref', 'rss', 'feed', 'feedburner', 'cmp', 'origin'
    ];
    trackingParams.forEach(param => url.searchParams.delete(param));
    return url.toString();
  } catch (e) {
    return urlStr.trim();
  }
}

/**
 * Process a list of items (from RSS or HTML) through the relevance filter.
 */
function filterItems(items, source) {
  const validArticles = [];
  for (const item of items) {
    const title = item.title || '';
    const snippet = item.contentSnippet || item.content || item.summary || '';
    const url = cleanUrl(item.link || item.guid || '');

    if (!url) continue;
    if (!isRelevant(title, snippet, source.region)) continue;

    validArticles.push({
      title: title.trim().slice(0, 500),
      url: url,
      source: source.name,
      snippet: snippet.trim().slice(0, 1000) || null,
      sentiment: tagSentiment(title, snippet),
      impact_score: scoreImpact(title, snippet),
      region: source.region,
      published_at: parseSafeDate(item.pubDate),
    });
  }
  return validArticles;
}

/**
 * Scrape all configured RSS sources and save relevant articles.
 * Uses RSS first, falls back to HTML scraping if RSS fails.
 * Returns a summary of what was found and saved.
 */
async function scrapeAll() {
  const results = {
    sourcesChecked: 0,
    sourcesFailed: 0,
    sourcesHTML: 0,
    articlesFound: 0,
    articlesRelevant: 0,
    articlesSaved: 0,
    errors: [],
  };

  const allArticles = [];
  const BATCH_SIZE = 20;

  for (let i = 0; i < sources.length; i += BATCH_SIZE) {
    const batch = sources.slice(i, i + BATCH_SIZE);
    
    // Process batch concurrently
    const promises = batch.map(async (source) => {
      // Attempt 1: RSS Parser
      try {
        const feed = await parser.parseURL(source.url);
        const items = feed.items || [];
        const validArticles = filterItems(items, source);
        return { success: true, method: 'rss', source, itemsFound: items.length, articles: validArticles };
      } catch (rssErr) {
        // Attempt 2: HTML Fallback
        try {
          const htmlItems = await scrapeHTML(source.url);
          if (htmlItems.length > 0) {
            const validArticles = filterItems(htmlItems, source);
            return { success: true, method: 'html', source, itemsFound: htmlItems.length, articles: validArticles };
          }
        } catch (htmlErr) {
          // Both failed
        }
        return { success: false, source, error: rssErr.message };
      }
    });

    const batchResults = await Promise.all(promises);
    
    // Aggregate results
    for (const res of batchResults) {
      results.sourcesChecked++;
      if (res.success) {
        if (res.method === 'html') results.sourcesHTML++;
        results.articlesFound += res.itemsFound;
        results.articlesRelevant += res.articles.length;
        allArticles.push(...res.articles);
      } else {
        results.sourcesFailed++;
        results.errors.push({ source: res.source.name, error: res.error });
      }
    }
  }

  // Save all relevant articles to Supabase (upsert skips duplicates by URL)
  if (allArticles.length > 0) {
    // --- Phase 3: The Semantic AI Gauntlet ---
    // At this point, the naive regex has filtered 4,000+ raw headlines down to a few hundred broad matches.
    // Now, we batch-process them through Gemini 1.5 Flash to eliminate false positives (like Hajj logicstics).
    const preDbCount = allArticles.length;
    let validatedArticles = allArticles;
    
    if (preDbCount > 0) {
      console.log(`Sending ${preDbCount} broad matches to Gemini AI for Deep Semantic Validation...`);
      validatedArticles = await validateBatch(allArticles);
      console.log(`AI Gauntlet Complete! Verified ${validatedArticles.length} / ${preDbCount} articles.`);

      // --- Phase 3.5: Deep-Dive Intelligence for Global Articles ---
      // Global (non-Bangladesh) articles get full-text extraction + intelligence notes
      // focusing on how Bangladesh is portrayed in international press.
      validatedArticles = await deepDiveGlobalArticles(validatedArticles);

      // --- Phase 3.6: Lightweight Local Rationale ---
      // Local articles get a short intelligence note using title+snippet only (no full-text fetch).
      // This is a cheap batch call well within free-tier token budget.
      validatedArticles = await generateLocalRationale(validatedArticles);
    }

    // --- Phase 3.7: Rationale-Based Rejection Catch ---
    // If the AI generated note explicitly states there are no business/economic implications,
    // we set the impact_score to 0 so that it gets dropped in Phase 4.
    validatedArticles = validatedArticles.map(art => {
      const note = (art.ai_rationale || '').toLowerCase();
      const noImplicationPatterns = [
        'no direct business',
        'no business implication',
        'no economic implication',
        'no direct economic',
        'no direct implication',
        'no implication for business',
        'no implication for investment',
        'no investment implication',
        'no direct impact',
        'unrelated to business',
        'unrelated to investment',
        'no practical business'
      ];
      if (noImplicationPatterns.some(p => note.includes(p))) {
        console.log(`🚫 AI Rationale Reject: Dropping "${art.title}" (Rationale says: "${art.ai_rationale}")`);
        return { ...art, impact_score: 0 };
      }
      return art;
    });

    // --- Phase 4: Deduplicate and Save ---
    const preSaveCount = validatedArticles.length;
    const uniqueMap = new Map();
    // Exclude articles with impact_score === 0 (unimportant/no business implication)
    validatedArticles
      .filter(a => a.impact_score !== 0)
      .forEach(a => uniqueMap.set(a.url, a));
    const dedupedArticles = Array.from(uniqueMap.values());
    
    if (dedupedArticles.length > 0) {
      const { data, error } = await createManyArticles(dedupedArticles);
      if (error) {
        console.error('  ❌ Database save error:', JSON.stringify(error, null, 2));
        results.errors.push({ source: 'database', error: JSON.stringify(error) });
      } else {
        results.articlesSaved = data?.length || 0;
      }
      console.log(`Successfully batched ${dedupedArticles.length} true intelligence articles to database.`);
    } else {
      console.log('No new relevant articles found matching the strict filters.');
    }
  }

  return results;
}

module.exports = { scrapeAll };
