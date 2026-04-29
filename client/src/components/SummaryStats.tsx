import { TrendingUp, AlertTriangle, Globe, Activity, Loader2, Brain } from "lucide-react";
import { useStats, useExecutiveSummary } from "@/hooks/use-news";

/** Map weighted score to a qualitative label */
function confidenceLabel(score: number): { text: string; color: string } {
  if (score >= 70) return { text: "Bullish", color: "text-emerald-500" };
  if (score >= 55) return { text: "Cautiously Positive", color: "text-emerald-400" };
  if (score >= 45) return { text: "Mixed", color: "text-yellow-500" };
  if (score >= 30) return { text: "Cautious", color: "text-orange-400" };
  return { text: "Bearish", color: "text-red-500" };
}

export const SummaryStats = () => {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: executive, isLoading: execLoading } = useExecutiveSummary();

  const total = stats?.total ?? 0;
  const opportunity = stats?.opportunity ?? 0;
  const risk = stats?.risk ?? 0;
  const regulation = stats?.regulation ?? 0;

  const score = executive?.weightedScore ?? 50;
  const label = confidenceLabel(score);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm font-mono">Loading intelligence dashboard…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Climate Brief */}
      <div className="bg-card p-6 rounded-lg border border-border shadow-card">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-primary" strokeWidth={2} />
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                AI Climate Pulse
              </p>
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className={`text-3xl font-bold ${label.color}`}>
                {label.text}
              </span>
              <span className="text-sm font-mono text-muted-foreground">
                {score}/100
              </span>
            </div>

            <div className="h-1.5 w-full max-w-xs bg-muted rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${score}%` }}
              />
            </div>

            {execLoading ? (
              <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating executive brief…
              </p>
            ) : executive?.narrative ? (
              <p className="text-sm text-foreground leading-relaxed max-w-2xl">
                {executive.narrative}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Executive brief will appear after the next data refresh.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Opportunities */}
        <div className="bg-card p-5 rounded-lg border border-border shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              Opportunities
            </p>
            <TrendingUp className="w-4 h-4 text-emerald-500" strokeWidth={2} />
          </div>
          <p className="text-3xl font-bold text-emerald-500">{opportunity}</p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {total > 0 ? `${Math.round((opportunity / total) * 100)}% of coverage` : "—"}
          </p>
        </div>

        {/* Risk Alerts */}
        <div className="bg-card p-5 rounded-lg border border-border shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              Risk Alerts
            </p>
            <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={2} />
          </div>
          <p className="text-3xl font-bold text-red-500">{risk}</p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {risk > 0 ? `${risk} requiring attention` : "No risk signals"}
          </p>
        </div>

        {/* Total Articles */}
        <div className="bg-card p-5 rounded-lg border border-border shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              Total Articles
            </p>
            <Globe className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
          </div>
          <p className="text-3xl font-bold">{total}</p>
          <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
            {opportunity} opportunity · {regulation} regulation · {risk} risk
          </p>
        </div>
      </div>
    </div>
  );
};
