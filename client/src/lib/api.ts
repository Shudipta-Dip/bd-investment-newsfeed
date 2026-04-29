// ---------------------------------------------------------------------------
// API service – talks to our Express backend
// ---------------------------------------------------------------------------
// This is the single place where the frontend communicates with the backend.
// Every component that needs data calls functions from here.

const API_BASE = "/api";

export type Sentiment = "opportunity" | "risk" | "regulation";

/** Shape of a news article as it comes from the database */
export type NewsItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  snippet: string | null;
  sentiment: Sentiment;
  impact_score: number;
  region: string | null;
  ai_rationale: string | null;
  published_at: string;
  action_taken: boolean;
  action_note: string | null;
  created_at: string;
};

export type DashboardStats = {
  total: number;
  opportunity: number;
  risk: number;
  regulation: number;
};

/** Fetch news articles with optional filters */
export async function fetchNews(params?: {
  sentiment?: string;
  search?: string;
  region?: string;
  magnitude?: string;
  limit?: number;
}): Promise<NewsItem[]> {
  const url = new URL(`${API_BASE}/news`, window.location.origin);
  if (params?.sentiment) {
    url.searchParams.set("sentiment", params.sentiment);
  }
  if (params?.search) {
    url.searchParams.set("search", params.search);
  }
  if (params?.region) {
    url.searchParams.set("region", params.region);
  }
  if (params?.magnitude) {
    url.searchParams.set("magnitude", params.magnitude);
  }
  if (params?.limit) {
    url.searchParams.set("limit", String(params.limit));
  }
  const res = await fetch(url.toString());
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to fetch news");
  return json.data;
}

/** Fetch dashboard stats (counts by sentiment) */
export async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/stats`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to fetch stats");
  return json.data;
}

/** Mark an article as handled / log an action */
export async function updateArticle(
  id: string,
  updates: { action_taken?: boolean; action_note?: string }
): Promise<NewsItem> {
  const res = await fetch(`${API_BASE}/news/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to update article");
  return json.data;
}

/** Shape of the executive climate summary */
export type ExecutiveSummary = {
  narrative: string;
  weightedScore: number;
};

/** Fetch AI-generated executive climate brief */
export async function fetchExecutiveSummary(): Promise<ExecutiveSummary> {
  const res = await fetch(`${API_BASE}/executive-summary`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to fetch summary");
  return json.data;
}
