const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const { extractArticleText } = require('./articleExtractor');

/**
 * Retry a function with exponential backoff.
 * Specifically targets 429 (rate limit) and 503 (overloaded) errors.
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelayMs = 5000) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRetryable = error.message && (
        error.message.includes('429') ||
        error.message.includes('503') ||
        error.message.includes('overloaded') ||
        error.message.includes('quota')
      );
      if (!isRetryable || attempt === maxRetries) throw error;
      const delay = baseDelayMs * Math.pow(2, attempt);
      console.log(`  ⏳ Rate limited. Retrying in ${delay / 1000}s (attempt ${attempt + 1}/${maxRetries})...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

let currentKeyIndex = 0;
let currentGroqIndex = 0;

/**
 * Safely parses LLM response text into a JSON array, with fallbacks for
 * common formatting errors (single quotes, outer wrapping objects, markdown block markers, and truncation).
 */
function parseJsonArraySafe(text) {
  if (!text) return [];
  let cleaned = text.trim();

  // Strip markdown code fences if present
  cleaned = cleaned.replace(/^```json\s*/i, '')
                   .replace(/^```\s*/i, '')
                   .replace(/```\s*$/i, '')
                   .trim();

  // Handle nested array in an outer wrapper object, e.g. {"results": [...]}
  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    try {
      const obj = JSON.parse(cleaned);
      for (const key of Object.keys(obj)) {
        if (Array.isArray(obj[key])) {
          return obj[key];
        }
      }
    } catch (_) {}
  }

  // Attempt direct standard parse
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {}

  // Attempt single quote replacement fallback
  try {
    const doubleQuoted = cleaned.replace(/'/g, '"');
    const parsed = JSON.parse(doubleQuoted);
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {}

  // Attempt regex array extraction
  try {
    const match = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}

  // Attempt partial recovery for truncated/malformed outputs (extract valid objects)
  try {
    const objects = [];
    const regex = /\{[^{}]*\}/g;
    let match;
    while ((match = regex.exec(cleaned)) !== null) {
      try {
        const obj = JSON.parse(match[0].replace(/'/g, '"'));
        if (obj && typeof obj === 'object') {
          objects.push(obj);
        }
      } catch (_) {}
    }
    if (objects.length > 0) return objects;
  } catch (_) {}

  return [];
}


/**
 * Build a Groq client instance with API key rotation.
 */
function getRotatedGroq() {
  const keys = [];
  if (process.env.GROQ_API_KEY_1) keys.push(process.env.GROQ_API_KEY_1);
  if (process.env.GROQ_API_KEY_2) keys.push(process.env.GROQ_API_KEY_2);

  if (keys.length === 0) {
    console.warn('⚠️ No GROQ_API_KEYs found. High-volume AI tasks will be skipped.');
    return null;
  }

  const keyIdx = currentGroqIndex % keys.length;
  currentGroqIndex++;

  return new Groq({ apiKey: keys[keyIdx] });
}

/**
 * Build a Gemini model instance with API key rotation.
 * @param {string} purpose - 'validation' | 'analysis' — spreads quota across keys
 */
function getRotatedModel(purpose = 'validation') {
  const keys = [];
  if (process.env.GEMINI_API_KEY_1) keys.push(process.env.GEMINI_API_KEY_1);
  if (process.env.GEMINI_API_KEY_2) keys.push(process.env.GEMINI_API_KEY_2);
  if (process.env.GEMINI_API_KEY_3) keys.push(process.env.GEMINI_API_KEY_3);
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);

  if (keys.length === 0) {
    console.warn('⚠️ No GEMINI_API_KEYs found. AI features will be skipped.');
    return null;
  }

  // Spread quota: 'analysis' tasks use a different key than 'validation'
  let keyIdx = currentKeyIndex % keys.length;
  if (purpose === 'analysis' && keys.length >= 2) {
    keyIdx = (currentKeyIndex + 1) % keys.length;
  }
  currentKeyIndex++;

  const genAI = new GoogleGenerativeAI(keys[keyIdx]);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });
}

// ============================================================================
// 1. BATCH VALIDATION + CLASSIFICATION (every scrape — single API call)
// ============================================================================

const VALIDATION_SYSTEM = `
# IDENTITY
You are an elite financial intelligence analyst at the Bangladesh Investment Development Authority (BIDA).

# TASK
For each headline, you must:
1. DECIDE if it is relevant business/economic/investment news about Bangladesh.
2. CLASSIFY every relevant article into exactly one sentiment category.
3. ASSIGN an impact score (0-100).

# SENTIMENT TAXONOMY
- "opportunity" — Positive investment signals: FDI announcements, export growth, infrastructure launches, corporate expansions, trade agreements, market rallies, startup funding, growth indicators, credit rating upgrades.
- "risk" — Threats and warning signals: inflation spikes, currency depreciation, trade deficits, capital flight, political instability, regulatory crackdowns, sanctions, debt defaults, energy crises, factory closures.
- "regulation" — Government/policy developments that are factual/procedural: new tax rules, central bank rate decisions, budget allocations, customs changes, compliance frameworks, bilateral MOUs, SEZ policy updates.

# IMPACT SCORING (0-100)
- 90-100: Market-moving. Affects billions (sovereign default risk, mega-FDI).
- 70-89: High. Sector-wide implications (trade agreement, major policy reform).
- 50-69: Moderate. Notable but limited scope (single company, regional infrastructure).
- 30-49: Low. Minor/routine (small product launch, quarterly report).
- 0-29: Minimal. Marginal relevance.

# REJECTION RULES
EXCLUDE: religion, general politics without economic impact, crime, entertainment, sports, lifestyle, international news passively mentioning Bangladesh.
`;

/**
 * Validates, classifies, and scores a batch of articles using Groq (Llama-3-8b).
 * High-speed validation offloaded to Groq to save Gemini quota.
 */
async function validateBatch(articles) {
  if (articles.length === 0) return articles;

  const validated = [];
  const chunkSize = 20;

  for (let i = 0; i < articles.length; i += chunkSize) {
    const chunk = articles.slice(i, i + chunkSize);
    // Grab a rotated key per chunk to spread TPM across multiple accounts
    const groq = getRotatedGroq();
    if (!groq) {
        console.warn('⚠️ No Groq client. Skipping chunk mapping.');
        continue;
    }

    const payload = chunk.map((a, idx) =>
      `ID: ${idx} | Title: ${a.title} | Context: ${a.snippet || ''}`
    ).join('\n');

    const prompt = `${VALIDATION_SYSTEM}

Analyze ${chunk.length} headlines. Return a valid JSON array of objects for RELEVANT articles only.
Format: [{"id": 0, "sentiment": "opportunity", "impact": 85}, ...]
Do not wrap in an outer object. Do not include markdown code block syntax. Output ONLY a valid JSON array with double quotes. No commentary, no explanation.

HEADLINES:
${payload}`;

    try {
      const completion = await retryWithBackoff(() => groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0,
        max_tokens: 1000,
      }));
      
      const text = completion.choices[0].message.content;
      const parsed = parseJsonArraySafe(text);
      if (parsed.length === 0) throw new Error('No valid array items parsed');

      for (const entry of parsed) {
        const idx = entry.id;
        if (idx >= 0 && idx < chunk.length) {
          const article = { ...chunk[idx] };
          if (['opportunity', 'risk', 'regulation'].includes(entry.sentiment)) {
            article.sentiment = entry.sentiment;
          }
          if (typeof entry.impact === 'number' && entry.impact >= 0 && entry.impact <= 100) {
            article.impact_score = entry.impact;
          }
          validated.push(article);
        }
      }
    } catch (error) {
      console.error('AI validation chunk error (after retries):', error.message);
      console.warn('  ⚠️ Skipping failure chunk to prevent db pollution.');
    }
  }

  return validated;
}

// ============================================================================
// 2. DEEP-DIVE ANALYSIS — Global articles only (full-text extraction)
// ============================================================================
// Focus: How is Bangladesh being PORTRAYED in international press?

/**
 * For global articles, fetch full article text and generate a deep intelligence note.
 * The note focuses on how Bangladesh's investment climate is being framed internationally.
 *
 * @param {Array} articles - All validated articles
 * @param {number} maxGlobal - Max global articles to deep-dive (default 15)
 */
async function deepDiveGlobalArticles(articles, maxGlobal = 15) {
  const model = getRotatedModel('analysis');
  if (!model) return articles;

  const globalArticles = articles.filter(a => a.region !== 'Bangladesh');
  if (globalArticles.length === 0) return articles;

  const toAnalyze = globalArticles.slice(0, maxGlobal);
  console.log(`  🔬 Deep-diving ${toAnalyze.length} global articles (fetching full text)...`);

  // Fetch full text concurrently
  const enriched = await Promise.all(toAnalyze.map(async (article) => {
    const fullText = await extractArticleText(article.url);
    return { ...article, _fullText: fullText };
  }));

  const payload = enriched.map((a, i) =>
    `ID: ${i}
Title: ${a.title}
Source: ${a.source} (${a.region})
Current Sentiment: ${a.sentiment} | Current Impact: ${a.impact_score}
Full Article Text:
${a._fullText || a.snippet || 'Not available'}`
  ).join('\n---\n');

  const prompt = `You are analyzing how international media portrays Bangladesh's investment and economic landscape. For each article below:

1. Write an "Intelligence Note" (max 20 words) that captures the NARRATIVE FRAMING — how is Bangladesh being presented? Is the tone confident, cautious, critical, or promotional? What is the key takeaway for a Bangladeshi investment authority monitoring global perception?

2. Refine the impact score based on the full article content. A global article that reaches a wide international audience and shapes foreign investor perception should score higher than its headline alone might suggest.

Return a valid JSON array of objects:
[
  {"id": 0, "rationale": "note here...", "impact": 80},
  ...
]
Do not wrap in an outer object. Do not include markdown code block syntax. Output ONLY a valid JSON array with double quotes. No commentary.

ARTICLES:
${payload}`;

  try {
    const result = await retryWithBackoff(() => model.generateContent(prompt));
    const text = result.response.text();
    const parsed = parseJsonArraySafe(text);
    if (parsed.length === 0) throw new Error('No valid array items parsed');

    const articleUrlMap = new Map(articles.map((a, i) => [a.url, i]));

    for (const entry of parsed) {
      if (entry.id >= 0 && entry.id < toAnalyze.length) {
        const globalArticle = toAnalyze[entry.id];
        const originalIdx = articleUrlMap.get(globalArticle.url);
        if (originalIdx !== undefined) {
          if (entry.rationale) articles[originalIdx].ai_rationale = entry.rationale;
          if (typeof entry.impact === 'number' && entry.impact >= 0 && entry.impact <= 100) {
            articles[originalIdx].impact_score = entry.impact;
          }
        }
      }
    }
    console.log(`  ✅ Deep-dive complete: ${parsed.length} intelligence notes generated.`);
  } catch (error) {
    console.error('  ⚠️ Deep-dive error (after retries, non-fatal):', error.message);
  }

  return articles;
}

// ============================================================================
// 3. LIGHTWEIGHT LOCAL RATIONALE (title+snippet only — cheap batch call)
// ============================================================================

/**
 * Generate short intelligence notes for local (Bangladesh) articles.
 * Uses Groq (Llama-3-8b) to blast through simple operational context creation rapidly.
 */
async function generateLocalRationale(articles) {
  const groq = getRotatedGroq();
  if (!groq) return articles;

  const localArticles = articles
    .map((a, origIdx) => ({ ...a, _origIdx: origIdx }))
    .filter(a => a.region === 'Bangladesh' && !a.ai_rationale);

  if (localArticles.length === 0) return articles;

  console.log(`  📝 Generating rationale for ${localArticles.length} local articles via Groq in chunks...`);

  const chunkSize = 20;
  for (let i = 0; i < localArticles.length; i += chunkSize) {
    const chunk = localArticles.slice(i, i + chunkSize);
    const payload = chunk.map((a, idx) =>
      `ID: ${idx} | ${a.sentiment.toUpperCase()} | ${a.title} | ${(a.snippet || '').slice(0, 200)}`
    ).join('\n');

    const prompt = `For each Bangladesh business news headline below, write a concise intelligence note (max 15 words) explaining the practical business implication. Focus on who is affected and what changes.

Return a valid JSON array of objects: [{"id": 0, "rationale": "note here..."}, ...]
Do not wrap in an outer object. Do not include markdown code block syntax. Output ONLY a valid JSON array with double quotes. No commentary.

HEADLINES:
${payload}`;

    try {
      const completion = await retryWithBackoff(() => groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0,
        max_tokens: 1500,
      }), 2, 3000);
      
      const text = completion.choices[0].message.content;
      const parsed = parseJsonArraySafe(text);
      if (parsed.length === 0) throw new Error('No valid array items parsed');

      for (const entry of parsed) {
        if (entry.id >= 0 && entry.id < chunk.length && entry.rationale) {
          const origIdx = chunk[entry.id]._origIdx;
          articles[origIdx].ai_rationale = entry.rationale;
        }
      }
    } catch (error) {
      console.error(`  ⚠️ Local rationale chunk error (after retries, non-fatal):`, error.message);
    }
  }

  console.log(`  ✅ Local rationale complete.`);
  return articles;
}

// ============================================================================
// 4. EXECUTIVE CLIMATE SUMMARY (AI-powered dashboard header)
// ============================================================================

// In-memory cache for the executive summary to prevent Gemini rate limit exhaustion
let summaryCache = {
  fingerprint: null,
  data: null,
};

/**
 * Generate a deterministic fingerprint/hash key for a set of articles.
 */
function getArticlesFingerprint(articles) {
  if (!articles || articles.length === 0) return '';
  const sorted = [...articles].sort((a, b) => (a.url || '').localeCompare(b.url || ''));
  return sorted.map(a => `${a.id || ''}-${a.sentiment || ''}-${a.impact_score || ''}-${a.action_taken ? 't' : 'f'}`).join('|');
}

/**
 * Generate an AI executive summary of the current investment climate.
 * Global articles receive 2x weight in the confidence score because
 * international perception has outsized impact on FDI decisions.
 */
async function generateExecutiveSummary(articles) {
  const model = getRotatedModel('analysis');

  if (!model || !articles || articles.length === 0) {
    return {
      narrative: 'Insufficient data to generate climate assessment.',
      weightedScore: 50,
    };
  }

  // 0. Check Content-Based Cache
  const fingerprint = getArticlesFingerprint(articles);
  if (summaryCache.fingerprint === fingerprint && summaryCache.data) {
    console.log('♻️ Returning cached AI executive summary (fingerprint match)');
    return summaryCache.data;
  }

  // 1. Calculate Group Scores
  function calcGroupScore(group) {
    if (group.length === 0) return null;
    let totalW = 0;
    let oppW = 0;
    let regW = 0;
    for (const a of group) {
      const w = a.impact_score || 40;
      totalW += w;
      if (a.sentiment === 'opportunity') oppW += w;
      if (a.sentiment === 'regulation') regW += w;
    }
    if (totalW === 0) return 50;
    return ((oppW + regW * 0.5) / totalW) * 100;
  }

  const globalArticles = articles.filter(a => a.region !== 'Bangladesh');
  const localArticles = articles.filter(a => a.region === 'Bangladesh');

  const globalScore = calcGroupScore(globalArticles);
  const localScore = calcGroupScore(localArticles);

  // 2. 70% Global / 30% Local split
  let finalScore = 50;
  if (globalScore !== null && localScore !== null) {
    finalScore = (globalScore * 0.7) + (localScore * 0.3);
  } else if (globalScore !== null) {
    finalScore = globalScore;
  } else if (localScore !== null) {
    finalScore = localScore;
  }
  const weightedScore = Math.round(finalScore);

  const opportunityCount = articles.filter(a => a.sentiment === 'opportunity').length;
  const riskCount = articles.filter(a => a.sentiment === 'risk').length;
  const regulationCount = articles.filter(a => a.sentiment === 'regulation').length;

  // 3. Extract top Global intelligent notes for narrative context
  const globalContext = globalArticles
    .sort((a, b) => (b.impact_score || 0) - (a.impact_score || 0))
    .slice(0, 8)
    .map(a => `[Global | Impact: ${a.impact_score}] ${a.title} - AI Note: ${a.ai_rationale || 'N/A'}`)
    .join('\n');

  const prompt = `You are writing a 2-sentence executive intelligence brief for the BIDA dashboard.
The assessment must be heavily driven by international perception.

7-day snapshot:
- Total: ${articles.length} articles (${globalArticles.length} international, ${localArticles.length} local)
- Opportunities: ${opportunityCount} | Risks: ${riskCount} | Regulation: ${regulationCount}
- Current Climate Sentiment Score: ${weightedScore}/100

Key International Narratives (Focus heavily on these intelligent notes):
${globalContext}

Write exactly 2 sentences:
Sentence 1: State the overall investment climate and WHY, prioritizing the international narrative.
Sentence 2: Highlight the single most important global signal or risk for foreign investors.

CRITICAL INSTRUCTIONS:
- Be specific. No fluff. No labels (do not write "Sentence 1:", "Sentence 2:", etc.).
- Output ONLY the 2 sentences.
- Do NOT mention any internal scoring formulas, weight splits (e.g., 70% or 30%), or system indicators. Focus purely on describing the economic and investment landscape itself.`;

  try {
    const result = await retryWithBackoff(() => model.generateContent(prompt));
    const narrative = result.response.text().trim();
    const summaryData = { narrative, weightedScore };
    
    // Only cache valid narratives (not the fallback error message)
    if (narrative && narrative !== 'Climate assessment temporarily unavailable.') {
      summaryCache = { fingerprint, data: summaryData };
    }
    
    return summaryData;
  } catch (error) {
    console.error('Executive summary error:', error.message);
    console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return { narrative: 'Climate assessment temporarily unavailable.', weightedScore };
  }
}

module.exports = {
  validateBatch,
  deepDiveGlobalArticles,
  generateLocalRationale,
  generateExecutiveSummary,
};
