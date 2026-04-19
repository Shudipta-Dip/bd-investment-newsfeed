export type Sentiment = "negative" | "positive" | "neutral";

export type NewsItem = {
  id: string;
  headline: string;
  snippet: string;
  source: string;
  author?: string;
  publishedAt: string; // ISO
  sentiment: Sentiment;
  impact: number; // 0-100
  region: string;
  tags: string[];
  url?: string;
  buzzTrend?: number; // % traction
};

const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 3600 * 1000).toISOString();

export const newsItems: NewsItem[] = [
  {
    id: "n1",
    headline:
      'Analysts warn of potential "Red Tape" delays in new Special Economic Zones',
    snippet:
      "A deep-dive report suggests bureaucratic hurdles might deter Japanese investors in the BEZA regions, citing slow approval timelines and unclear tax holiday extensions.",
    source: "Reuters",
    author: "Nakamura Hiroshi",
    publishedAt: hoursAgo(2),
    sentiment: "negative",
    impact: 92,
    region: "Japan",
    tags: ["BEZA", "Tax Policy", "FDI"],
    buzzTrend: 38,
  },
  {
    id: "n2",
    headline:
      "Bangladesh Infrastructure Boom: A New Hub for Regional Connectivity",
    snippet:
      "Nikkei highlights the Matarbari deep-sea port as a game-changer for the Bay of Bengal investment corridor, projecting double-digit logistics growth by 2027.",
    source: "Nikkei Asia",
    author: "Sato Aiko",
    publishedAt: hoursAgo(5),
    sentiment: "positive",
    impact: 85,
    region: "Asia-Pacific",
    tags: ["Matarbari", "Infrastructure"],
    buzzTrend: 64,
  },
  {
    id: "n3",
    headline:
      "Financial Times: Bangladesh tax reforms send mixed signals to multinationals",
    snippet:
      "FT's editorial board questions consistency across recent VAT amendments, calling for clarification ahead of the next IMF review.",
    source: "Financial Times",
    author: "Eleanor Whitcombe",
    publishedAt: hoursAgo(7),
    sentiment: "negative",
    impact: 88,
    region: "United Kingdom",
    tags: ["Tax Policy", "IMF"],
    buzzTrend: 41,
  },
  {
    id: "n4",
    headline:
      "Bloomberg: Garments sector posts record export quarter, lifts FDI outlook",
    snippet:
      "RMG export growth of 14% YoY is being cited by Asian funds as a stabilizing signal for emerging-market allocations.",
    source: "Bloomberg",
    author: "Daniel Kerr",
    publishedAt: hoursAgo(9),
    sentiment: "positive",
    impact: 78,
    region: "United States",
    tags: ["RMG", "Exports"],
    buzzTrend: 52,
  },
  {
    id: "n5",
    headline:
      "WSJ explores PPPA pipeline: 'Cautious optimism' on Payra and Dhaka MRT",
    snippet:
      "A balanced feature framing PPPA's project pipeline as ambitious but contingent on regulatory clarity for foreign concessionaires.",
    source: "Wall Street Journal",
    author: "Priya Menon",
    publishedAt: hoursAgo(12),
    sentiment: "neutral",
    impact: 64,
    region: "United States",
    tags: ["PPPA", "Payra", "MRT"],
    buzzTrend: 22,
  },
  {
    id: "n6",
    headline:
      "Infrastructure Investor: Bangladesh climbs three places in regional FDI attractiveness",
    snippet:
      "A trade-journal index ranks BD ahead of two ASEAN peers, citing improved one-stop service performance at BIDA.",
    source: "Infrastructure Investor",
    publishedAt: hoursAgo(18),
    sentiment: "positive",
    impact: 71,
    region: "Global",
    tags: ["BIDA", "Index"],
    buzzTrend: 19,
  },
  {
    id: "n7",
    headline:
      "ADB working paper flags climate-resilience financing gap for SEZs",
    snippet:
      "ADB recommends blended finance frameworks; potentially supportive for BEZA's green-zone proposals.",
    source: "ADB Briefs",
    publishedAt: hoursAgo(22),
    sentiment: "neutral",
    impact: 58,
    region: "Asia-Pacific",
    tags: ["Climate", "BEZA", "Finance"],
    buzzTrend: 12,
  },
  {
    id: "n8",
    headline:
      "Reuters: Indian conglomerates eye expansion into Bangladesh power sector",
    snippet:
      "Two Mumbai-listed groups are reportedly in talks for grid-modernization JVs, signaling renewed regional confidence.",
    source: "Reuters",
    publishedAt: hoursAgo(26),
    sentiment: "positive",
    impact: 74,
    region: "India",
    tags: ["Power", "Joint Venture"],
    buzzTrend: 33,
  },
];

export const dashboardSummary = {
  positivePct: 74,
  totalArticles: 142,
  responseRate: 92,
  responseDelta: 4,
  criticalCount: 3,
  topSources: ["Reuters", "Bloomberg", "Financial Times", "Nikkei", "WSJ"],
};
