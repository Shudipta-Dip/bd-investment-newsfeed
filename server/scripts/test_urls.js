const Parser = require('rss-parser');
const parser = new Parser({ timeout: 5000 });

function matchKeyword(text, kw) {
  if (!/^[a-z]+$/.test(kw)) return text.includes(kw);
  return new RegExp('\\b' + kw + '\\b', 'i').test(text);
}

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

async function testProthomAlo() {
  const feed = await parser.parseURL('https://en.prothomalo.com/feed');
  console.log(`✅ SUCCESS: Prothom Alo -> ${feed.items.length} items\n`);
  
  feed.items.forEach(item => {
    const text = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
    const hasBusiness = BUSINESS_KEYWORDS.some((kw) => matchKeyword(text, kw));
    console.log(`[${hasBusiness ? 'PASS' : 'FAIL'}] ${item.title}`);
  });
}

testProthomAlo();
