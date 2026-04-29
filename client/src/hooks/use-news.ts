import { useQuery } from "@tanstack/react-query";
import { fetchNews, fetchStats, fetchExecutiveSummary } from "@/lib/api";

/**
 * Hook to fetch news articles from the backend.
 * Automatically refetches when the filter or search changes.
 */
export function useNews(params?: {
  sentiment?: string;
  search?: string;
  region?: string;
  magnitude?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["news", params?.sentiment, params?.search, params?.region, params?.magnitude, params?.limit],
    queryFn: () => fetchNews(params),
    // Keep showing old data while new data loads (no flicker)
    placeholderData: (prev) => prev,
    // Refetch every 2 minutes to pick up new articles
    refetchInterval: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch dashboard stats (article counts by sentiment).
 */
export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch the AI-generated executive climate summary.
 * Cached for 5 minutes since this is an expensive AI call.
 */
export function useExecutiveSummary() {
  return useQuery({
    queryKey: ["executive-summary"],
    queryFn: fetchExecutiveSummary,
    // Cache for 5 min — this is an AI call, no need to spam it
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
