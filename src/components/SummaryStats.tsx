import { TrendingUp, Globe, Activity } from "lucide-react";
import { dashboardSummary } from "@/data/news";

export const SummaryStats = () => {
  const s = dashboardSummary;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-card p-6 rounded-lg border border-border shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            Narrative Impact
          </p>
          <Activity className="w-4 h-4 text-primary" strokeWidth={2} />
        </div>
        <p className="text-4xl font-bold text-primary mt-3">High</p>
        <div className="mt-3 h-1 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary w-[85%]" />
        </div>
        <p className="text-xs font-mono text-muted-foreground mt-2">
          85 / 100 — driven by FT &amp; Reuters
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            Response Rate
          </p>
          <TrendingUp className="w-4 h-4 text-positive" strokeWidth={2} />
        </div>
        <p className="text-4xl font-bold mt-3">{s.responseRate}%</p>
        <p className="text-xs text-positive mt-2 font-mono">
          ↑ {s.responseDelta}% from yesterday
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            Global Sources
          </p>
          <Globe className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
        </div>
        <p className="text-4xl font-bold mt-3">{s.totalArticles}</p>
        <p className="text-xs text-muted-foreground mt-2 font-mono truncate">
          {s.topSources.slice(0, 3).join(", ")} +{s.totalArticles - 3}
        </p>
      </div>
    </div>
  );
};
