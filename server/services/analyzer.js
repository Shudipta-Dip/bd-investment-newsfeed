// ---------------------------------------------------------------------------
// Keyword filter & sentiment tagger
// ---------------------------------------------------------------------------
// This is the "brain" that decides:
//   1. Is this article relevant to Bangladesh investment? (keyword filter)
//   2. Is this good news, bad news, or policy news? (sentiment tagger)

// The "Two-Key" Rule: Must contain at least one CONTEXT keyword AND one BUSINESS keyword.
// Or, it can pass automatically if it has a VIP keyword.

const CONTEXT_KEYWORDS = [
  'bangladesh', 'bangladeshi', 'dhaka', 'chittagong', 'chattogram', 'sylhet',
  'rajshahi', 'khulna', 'barisal', 'rangpur', 'mymensingh', 'comilla',
  'cox\'s bazar', 'bengali', 'taka', 'bdt'
];

const BUSINESS_KEYWORDS = [
  'investment', 'fdi', 'economy', 'economic', 'business', 'trade', 'startup',
  'infrastructure', 'market', 'stock', 'dse', 'bank', 'finance', 'financial',
  'tax', 'revenue', 'export', 'import', 'industry', 'garment', 'rmg', 'textile',
  'jute', 'leather', 'pharmaceutical', 'power', 'energy', 'logistics', 'port',
  'development', 'fund', 'capital', 'investor', 'corporate', 'manufacturing',
  'supply chain', 'deficit', 'inflation', 'gdp', 'reserves', 'remittance',
  'megaproject', 'venture', 'forex', 'commercial', 'real estate', 'tariff',
  'customs', 'subsidy', 'macroeconomic', 'microeconomic', 'imf', 'world bank'
];

const VIP_KEYWORDS = [
  'bida', 'beza', 'pppa', 'bepza', 'bscic', 'special economic zone', 'sez',
  'export processing zone', 'epz', 'matarbari', 'payra', 'bangladesh bank'
];

// Blocklist: Reject anything unrelated to economy/investment.
const BLOCKLIST_KEYWORDS = [
  // Sports
  'cricket', 'shakib', 'football', 'match', 'tournament', 'world cup', 'innings', 
  'wicket', 'goal', 'stadium', 'athlete', 'olympics', 'fifa', 'icc', 'bcci', 'bcb',
  // Entertainment / Lifestyle
  'actor', 'actress', 'movie', 'film', 'cinema', 'bollywood', 'dhallywood', 
  'song', 'music', 'concert', 'celebrity', 'gossip', 'wedding', 'theater',
  // Crime & Accidents (Unless tied to economy, best to filter out generic news)
  'murder', 'rape', 'arrest', 'police', 'court', 'sentenced', 'killed', 
  'road crash', 'accident', 'suicide', 'robbery', 'smuggling', 'drugs', 'yaba',
  'assault', 'brawl', 'homicide', 'kidnap', 'militant', 'terrorist'
];

function matchKeyword(text, kw) {
  // If the keyword contains a space or special char, use simple includes
  if (!/^[a-z]+$/.test(kw)) return text.includes(kw);
  // Otherwise enforce word boundaries
  return new RegExp('\\b' + kw + '\\b', 'i').test(text);
}

/**
 * Check if an article is relevant to Bangladesh investment.
 * Applies the Two-Key rule, the VIP pass, and the strict Blocklist.
 * @param {string} title 
 * @param {string} snippet 
 * @param {string} region 
 */
function isRelevant(title, snippet, region = '') {
  const lowerTitle = title.toLowerCase();
  const lowerSnippet = snippet.toLowerCase();

  // 1. Strict Blocklist (Never allow these)
  if (BLOCKLIST_KEYWORDS.some(kw => matchKeyword(lowerTitle, kw) || matchKeyword(lowerSnippet, kw))) {
    return false;
  }

  const hasContext = CONTEXT_KEYWORDS.some(kw => matchKeyword(lowerTitle, kw) || matchKeyword(lowerSnippet, kw));
  const hasBusiness = BUSINESS_KEYWORDS.some(kw => matchKeyword(lowerTitle, kw) || matchKeyword(lowerSnippet, kw));
  const hasVIP = VIP_KEYWORDS.some(kw => matchKeyword(lowerTitle, kw) || matchKeyword(lowerSnippet, kw));

  // For GLOBAL sources: Bangladesh must be explicitly mentioned.
  // VIP keywords like "sez" alone are not enough — they could refer to any country's SEZ.
  if (region !== 'Bangladesh') {
    return hasContext && (hasBusiness || hasVIP);
  }

  // For LOCAL (Bangladesh) sources:
  // VIP keywords get an instant pass (these are Bangladesh-specific entities like BIDA, BEZA).
  if (hasVIP) return true;
  // Otherwise require at least one business or context keyword.
  return hasContext || hasBusiness;
}

// Words that suggest NEGATIVE / CRITICAL sentiment
const NEGATIVE_KEYWORDS = [
  'warn', 'warning', 'crisis', 'decline', 'risk', 'threat', 'delay',
  'corruption', 'scandal', 'protest', 'strike', 'unrest', 'violence',
  'downgrade', 'deficit', 'inflation', 'debt', 'default', 'flee',
  'concern', 'fear', 'impose', 'sanction', 'ban', 'collapse',
  'red tape', 'bureaucratic', 'negative', 'criticism', 'condemn',
  'flood', 'cyclone', 'disaster', 'climate risk', 'tension',
  'mixed signal', 'deter', 'obstacle', 'hurdle', 'shortfall'
];

// Words that suggest POSITIVE / GROWTH sentiment
const POSITIVE_KEYWORDS = [
  'growth', 'boom', 'surge', 'rise', 'record', 'milestone',
  'investment', 'expand', 'attract', 'opportunity', 'progress',
  'infrastructure', 'connectivity', 'partnership', 'agreement',
  'upgrade', 'improve', 'reform', 'confidence', 'optimism',
  'hub', 'corridor', 'champion', 'ranks', 'climbs', 'innovation',
  'export', 'revenue', 'profit', 'success', 'launch', 'award'
];

/**
 * Tag an article's sentiment based on keyword analysis.
 * Returns 'risk', 'opportunity', or 'regulation'.
 * This is the FALLBACK — AI classification overrides this when available.
 */
function tagSentiment(title, snippet) {
  const text = `${title} ${snippet || ''}`.toLowerCase();

  let negScore = 0;
  let posScore = 0;

  NEGATIVE_KEYWORDS.forEach((kw) => {
    if (matchKeyword(text, kw)) negScore++;
  });

  POSITIVE_KEYWORDS.forEach((kw) => {
    if (matchKeyword(text, kw)) posScore++;
  });

  if (negScore > posScore && negScore >= 2) return 'risk';
  if (posScore > negScore && posScore >= 2) return 'opportunity';
  if (negScore > 0 && posScore === 0) return 'risk';
  if (posScore > 0 && negScore === 0) return 'opportunity';
  return 'regulation';
}

/**
 * Generate an impact score (0-100) based on keyword density.
 * More keyword hits = higher impact.
 */
function scoreImpact(title, snippet) {
  const text = `${title} ${snippet || ''}`.toLowerCase();
  let hits = 0;

  [...NEGATIVE_KEYWORDS, ...POSITIVE_KEYWORDS].forEach((kw) => {
    if (matchKeyword(text, kw)) hits++;
  });

  // Base score of 40, each keyword hit adds 5-8 points, capped at 98
  return Math.min(98, 40 + hits * 6);
}

module.exports = { isRelevant, tagSentiment, scoreImpact };
