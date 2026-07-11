import { TrendingUp, AlertTriangle, Globe, Activity, Loader2, Brain, HelpCircle } from "lucide-react";
import { useStats, useExecutiveSummary } from "@/hooks/use-news";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GlobePulse } from "@/components/ui/cobe-globe-pulse";

/** Map weighted score to a qualitative label */
function confidenceLabel(score: number): { text: string; color: string } {
  if (score >= 70) return { text: "Bullish", color: "text-emerald-500" };
  if (score >= 55) return { text: "Cautiously Positive", color: "text-emerald-400" };
  if (score >= 45) return { text: "Mixed", color: "text-yellow-500" };
  if (score >= 30) return { text: "Cautious", color: "text-orange-400" };
  return { text: "Bearish", color: "text-red-500" };
}

interface SummaryStatsProps {
  /** Country/region names from the currently displayed news articles */
  regions?: string[];
}

export const SummaryStats = ({ regions = [] }: SummaryStatsProps) => {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: executive, isLoading: execLoading, isError: execError } = useExecutiveSummary();

  const total = stats?.total ?? 0;
  const opportunity = stats?.opportunity ?? 0;
  const risk = stats?.risk ?? 0;
  const regulation = stats?.regulation ?? 0;

  const score = executive?.weightedScore;
  const hasData = score !== undefined && executive?.narrative !== 'Climate assessment temporarily unavailable.';

  let labelText = "Mixed";
  let labelColor = "text-yellow-500";
  let scoreText = "50";
  let progressWidth = 50;

  if (execLoading) {
    labelText = "Assessing...";
    labelColor = "text-muted-foreground animate-pulse";
    scoreText = "--";
    progressWidth = 0;
  } else if (execError || !hasData) {
    labelText = "Unavailable";
    labelColor = "text-muted-foreground";
    scoreText = "--";
    progressWidth = 0;
  } else if (score !== undefined) {
    const labelInfo = confidenceLabel(score);
    labelText = labelInfo.text;
    labelColor = labelInfo.color;
    scoreText = score.toString();
    progressWidth = score;
  }

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
      <div className="bg-card p-6 lg:py-2 lg:px-8 rounded-lg border border-border shadow-card overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-stretch justify-between gap-6 min-h-[220px]">
          {/* Left side: Text content (vertically centered) */}
          <div className="flex-1 max-w-xl xl:max-w-2xl py-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-primary" strokeWidth={2} />
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                AI Climate Pulse
              </p>
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className={`text-3xl font-bold ${labelColor}`}>
                {labelText}
              </span>
              <span className="text-sm font-mono text-muted-foreground flex items-center gap-1.5">
                {scoreText}/100
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground transition-colors cursor-help outline-none">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3 bg-card border border-border text-foreground rounded-lg shadow-lg" side="right" align="center">
                      <div className="space-y-2 text-xs leading-relaxed">
                        <p className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground border-b pb-1">Scoring Methodology</p>
                        <p>
                          The score represents the health of the investment climate (0 = high threat, 100 = bullish growth).
                        </p>
                        <div>
                          <strong>1. Sentiment Weight:</strong> Opportunity updates increase the score, Risk updates decrease the score, and Regulation policy reports act neutral/partial.
                        </div>
                        <div>
                          <strong>2. Global Weighting:</strong> International coverage is weighted at <strong>70%</strong> and local coverage at <strong>30%</strong> because global narrative is a primary driver of foreign direct investment.
                        </div>
                        <div>
                          <strong>3. Classification Bounds:</strong>
                          <ul className="list-disc list-inside mt-1 pl-1 space-y-0.5">
                            <li><span className="text-emerald-500 font-bold">Bullish:</span> &ge; 70</li>
                            <li><span className="text-emerald-400 font-bold">Cautiously Positive:</span> 55–69</li>
                            <li><span className="text-yellow-500 font-bold">Mixed:</span> 45–54</li>
                            <li><span className="text-orange-400 font-bold">Cautious:</span> 30–44</li>
                            <li><span className="text-red-500 font-bold">Bearish:</span> &lt; 30</li>
                          </ul>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
            </div>

            <div className="h-1.5 w-full max-w-xs bg-muted rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressWidth}%` }}
              />
            </div>

            {execLoading ? (
              <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating executive brief…
              </p>
            ) : execError || !hasData ? (
              <p className="text-sm text-muted-foreground italic">
                Climate brief is temporarily unavailable. Check back in a few minutes.
              </p>
            ) : (
              <p className="text-sm text-foreground leading-relaxed max-w-2xl">
                {executive.narrative}
              </p>
            )}
          </div>

          {/* Right side: Animated Globe (desktop only, centered in the remaining blank space, snug height fit) */}
          {regions.length > 0 && (
            <div className="hidden lg:flex items-center justify-center flex-1 self-stretch py-2 min-w-[240px] max-w-[320px]">
              <GlobePulse regions={regions} className="w-full h-full aspect-square max-h-[280px] max-w-[280px]" speed={0.0025} />
            </div>
          )}
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
