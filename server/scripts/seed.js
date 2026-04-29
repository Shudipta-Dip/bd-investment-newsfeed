// Seed the database with sample news articles for testing.
// Run once: node seed.js

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();

const articles = [
  {
    title: 'Analysts warn of potential "Red Tape" delays in new Special Economic Zones',
    url: 'https://reuters.com/bd-sez-red-tape-2026',
    source: 'Reuters',
    snippet: 'A deep-dive report suggests bureaucratic hurdles might deter Japanese investors in the BEZA regions, citing slow approval timelines and unclear tax holiday extensions.',
    sentiment: 'critical',
    impact_score: 92,
    region: 'Japan',
    published_at: hoursAgo(2),
  },
  {
    title: 'Bangladesh Infrastructure Boom: A New Hub for Regional Connectivity',
    url: 'https://asia.nikkei.com/bd-infrastructure-boom',
    source: 'Nikkei Asia',
    snippet: 'Nikkei highlights the Matarbari deep-sea port as a game-changer for the Bay of Bengal investment corridor, projecting double-digit logistics growth by 2027.',
    sentiment: 'growth',
    impact_score: 85,
    region: 'Asia-Pacific',
    published_at: hoursAgo(5),
  },
  {
    title: 'Financial Times: Bangladesh tax reforms send mixed signals to multinationals',
    url: 'https://ft.com/bd-tax-reforms-signals',
    source: 'Financial Times',
    snippet: "FT's editorial board questions consistency across recent VAT amendments, calling for clarification ahead of the next IMF review.",
    sentiment: 'critical',
    impact_score: 88,
    region: 'United Kingdom',
    published_at: hoursAgo(7),
  },
  {
    title: 'Bloomberg: Garments sector posts record export quarter, lifts FDI outlook',
    url: 'https://bloomberg.com/bd-rmg-record-exports',
    source: 'Bloomberg',
    snippet: 'RMG export growth of 14% YoY is being cited by Asian funds as a stabilizing signal for emerging-market allocations.',
    sentiment: 'growth',
    impact_score: 78,
    region: 'United States',
    published_at: hoursAgo(9),
  },
  {
    title: "WSJ explores PPPA pipeline: 'Cautious optimism' on Payra and Dhaka MRT",
    url: 'https://wsj.com/bd-pppa-pipeline',
    source: 'Wall Street Journal',
    snippet: "A balanced feature framing PPPA's project pipeline as ambitious but contingent on regulatory clarity for foreign concessionaires.",
    sentiment: 'policy',
    impact_score: 64,
    region: 'United States',
    published_at: hoursAgo(12),
  },
  {
    title: 'Infrastructure Investor: Bangladesh climbs three places in regional FDI attractiveness',
    url: 'https://infrastructureinvestor.com/bd-fdi-ranking',
    source: 'Infrastructure Investor',
    snippet: 'A trade-journal index ranks BD ahead of two ASEAN peers, citing improved one-stop service performance at BIDA.',
    sentiment: 'growth',
    impact_score: 71,
    region: 'Global',
    published_at: hoursAgo(18),
  },
  {
    title: 'ADB working paper flags climate-resilience financing gap for SEZs',
    url: 'https://adb.org/bd-climate-sez-gap',
    source: 'ADB Briefs',
    snippet: "ADB recommends blended finance frameworks; potentially supportive for BEZA's green-zone proposals.",
    sentiment: 'policy',
    impact_score: 58,
    region: 'Asia-Pacific',
    published_at: hoursAgo(22),
  },
  {
    title: 'Reuters: Indian conglomerates eye expansion into Bangladesh power sector',
    url: 'https://reuters.com/bd-india-power-jv',
    source: 'Reuters',
    snippet: 'Two Mumbai-listed groups are reportedly in talks for grid-modernization JVs, signaling renewed regional confidence.',
    sentiment: 'growth',
    impact_score: 74,
    region: 'India',
    published_at: hoursAgo(26),
  },
];

async function seed() {
  console.log('🌱 Seeding database with sample articles...');

  const { data, error } = await supabase
    .from('news_articles')
    .upsert(articles, { onConflict: 'url' })
    .select();

  if (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }

  console.log(`✅ Seeded ${data.length} articles successfully!`);
  process.exit(0);
}

seed();
