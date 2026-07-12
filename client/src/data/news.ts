// ---------------------------------------------------------------------------
// Types & helpers shared across frontend components
// ---------------------------------------------------------------------------

import type { NewsItem as ApiNewsItem, Sentiment as ApiSentiment } from "@/lib/api";

// Frontend sentiment uses the same naming as the API now
export type Sentiment = "opportunity" | "risk" | "regulation";

export type NewsItem = {
  id: string;
  headline: string;
  snippet: string;
  source: string;
  publishedAt: string;
  sentiment: Sentiment;
  impact: number;
  region: string;
  aiRationale: string | null;
  tags: string[];
  url?: string;
  buzzTrend?: number;
  // Keep reference to raw DB fields for updates
  _dbId: string;
  _actionTaken: boolean;
  _actionNote: string | null;
};

/** Map database sentiment → frontend sentiment (now 1:1) */
const sentimentMap: Record<ApiSentiment, Sentiment> = {
  opportunity: "opportunity",
  risk: "risk",
  regulation: "regulation",
};

/** Convert an API article to the shape our components expect */
export function toNewsItem(article: ApiNewsItem): NewsItem {
  return {
    id: article.id,
    headline: article.title,
    snippet: article.snippet ?? "",
    source: article.source,
    publishedAt: article.published_at,
    sentiment: sentimentMap[article.sentiment] ?? "regulation",
    impact: article.impact_score ?? 50,
    region: article.region ?? "Global",
    aiRationale: article.ai_rationale ?? null,
    tags: [],
    url: article.url,
    buzzTrend: 0,
    _dbId: article.id,
  };
}

// Keep the dashboard summary type for the stats cards
export type DashboardSummary = {
  positivePct: number;
  totalArticles: number;
  responseRate: number;
  responseDelta: number;
  riskCount: number;
  topSources: string[];
};
