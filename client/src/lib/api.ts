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
  if (!json.success) {
    const errMsg = json.error?.message || (typeof json.error === "string" ? json.error : null) || "Failed to fetch news";
    throw new Error(errMsg);
  }
  return json.data;
}

/** Fetch dashboard stats (counts by sentiment) */
export async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/stats`);
  const json = await res.json();
  if (!json.success) {
    const errMsg = json.error?.message || (typeof json.error === "string" ? json.error : null) || "Failed to fetch stats";
    throw new Error(errMsg);
  }
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
  if (!json.success) {
    const errMsg = json.error?.message || (typeof json.error === "string" ? json.error : null) || "Failed to fetch summary";
    throw new Error(errMsg);
  }
  return json.data;
}

/** Subscribe to climate score drop email alerts */
export async function subscribeToAlerts(email: string, thresholdScore: number): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/alerts/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, threshold_score: thresholdScore }),
  });
  const json = await res.json();
  if (!json.success) {
    const errMsg = json.error?.message || (typeof json.error === "string" ? json.error : null) || "Failed to register alert subscription";
    throw new Error(errMsg);
  }
  return json;
}

/** Unsubscribe from climate score drop email alerts */
export async function unsubscribeFromAlerts(email: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/alerts/unsubscribe?email=${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!json.success) {
    const errMsg = json.error?.message || (typeof json.error === "string" ? json.error : null) || "Failed to unsubscribe from alerts";
    throw new Error(errMsg);
  }
  return json;
}

/** Chat with BIDA AI Agent */
export async function chatWithAgent(message: string, history?: { role: string; text: string }[]): Promise<string> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  const json = await res.json();
  if (!json.success) {
    const errMsg = json.error?.message || (typeof json.error === "string" ? json.error : null) || "Failed to chat with agent";
    throw new Error(errMsg);
  }
  return json.reply;
}
