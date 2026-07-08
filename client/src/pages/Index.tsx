import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { CriticalAlertBanner } from "@/components/CriticalAlertBanner";
import { SummaryStats } from "@/components/SummaryStats";
import { NewsCard } from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Globe, MapPin, Bell, BellRing, HelpCircle } from "lucide-react";
import { useNews } from "@/hooks/use-news";
import { useDebounce } from "@/hooks/use-debounce";
import { toNewsItem, type NewsItem } from "@/data/news";
import { InfiniteGridBackground } from "@/components/InfiniteGridBackground";
import { AlertSubscribe } from "@/components/AlertSubscribe";
import { useSearchParams } from "react-router-dom";
import { unsubscribeFromAlerts } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Database sentiment values
type ApiSentiment = "opportunity" | "risk" | "regulation";
type ApiRegion = "local" | "global";

const sentimentFilters: { key: ApiSentiment; label: string; color: string }[] = [
  { key: "opportunity", label: "Opportunity", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  { key: "risk", label: "Risk", color: "bg-red-500/10 text-red-400 border-red-500/30" },
  { key: "regulation", label: "Regulation", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
];

const regionFilters: { key: ApiRegion; label: string; icon: typeof Globe }[] = [
  { key: "local", label: "Local Media", icon: MapPin },
  { key: "global", label: "Global Insights", icon: Globe },
];

function getSliderMagnitudeInfo(value: number): {
  label: string;
  description: string;
  color: string;
  apiParam: string | undefined;
} {
  if (value >= 90) {
    return {
      label: "Systemic",
      description: "Severe, market-moving events (Score 90-100)",
      color: "text-red-400 font-bold",
      apiParam: "systemic",
    };
  }
  if (value >= 70) {
    return {
      label: "Sectoral",
      description: "Industry-wide implications (Score 70-89)",
      color: "text-orange-400 font-bold",
      apiParam: "sectoral,systemic",
    };
  }
  if (value >= 30) {
    return {
      label: "Notable",
      description: "Moderate localized scope (Score 30-69)",
      color: "text-blue-400 font-bold",
      apiParam: "notable,sectoral,systemic",
    };
  }
  return {
    label: "Routine",
    description: "Routine updates & minor releases (Score 0-29)",
    color: "text-muted-foreground font-semibold",
    apiParam: undefined,
  };
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const unsubscribeEmail = searchParams.get("unsubscribe");
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const { toast } = useToast();

  const handleConfirmUnsubscribe = async () => {
    if (!unsubscribeEmail) return;
    setIsUnsubscribing(true);
    try {
      await unsubscribeFromAlerts(unsubscribeEmail);
      toast({
        title: "Unsubscribed Successfully",
        description: `You have unsubscribed ${unsubscribeEmail} from all climate alerts.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Unsubscribe Failed",
        description: err.message || "An error occurred while unsubscribing.",
      });
    } finally {
      setIsUnsubscribing(false);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("unsubscribe");
      setSearchParams(newParams);
    }
  };

  const handleCancelUnsubscribe = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("unsubscribe");
    setSearchParams(newParams);
  };

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Multi-select state: empty Set = show all
  const [selectedSentiments, setSelectedSentiments] = useState<Set<ApiSentiment>>(new Set());
  const [selectedRegions, setSelectedRegions] = useState<Set<ApiRegion>>(new Set());
  const [magnitudeValue, setMagnitudeValue] = useState<number>(0);

  const toggleSentiment = (key: ApiSentiment) => {
    setSelectedSentiments((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleRegion = (key: ApiRegion) => {
    setSelectedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Build API params
  const apiSentiment = selectedSentiments.size > 0
    ? Array.from(selectedSentiments).join(",")
    : undefined;
  
  const sliderInfo = useMemo(() => getSliderMagnitudeInfo(magnitudeValue), [magnitudeValue]);
  const apiMagnitude = magnitudeValue > 0 ? String(magnitudeValue) : undefined;
  
  const apiRegion = selectedRegions.size > 0 
    ? Array.from(selectedRegions).join(",") 
    : undefined;

  const { data: rawArticles, isLoading } = useNews({
    sentiment: apiSentiment,
    search: debouncedSearch || undefined,
    region: apiRegion,
    magnitude: apiMagnitude,
  });

  // Convert API data → shape our components expect
  const newsItems = useMemo(
    () => (rawArticles ?? []).map(toNewsItem),
    [rawArticles],
  );

  const topRisk = useMemo(
    () =>
      [...newsItems]
        .filter((n) => n.sentiment === "risk")
        .sort((a, b) => b.impact - a.impact)[0],
    [newsItems],
  );

  const exportToCSV = () => {
    if (!rawArticles || rawArticles.length === 0) return;

    const escapeCSV = (val: any) => {
      const stringVal = val === null || val === undefined ? "" : String(val);
      return `"${stringVal.replace(/"/g, '""')}"`;
    };

    const headers = ["Title", "Date", "Source", "Sentiment", "Impact", "Region", "URL"];
    const rows = rawArticles.map(a => [
      escapeCSV(a.title),
      escapeCSV(new Date(a.published_at).toLocaleString()),
      escapeCSV(a.source),
      escapeCSV(a.sentiment),
      escapeCSV(a.impact_score),
      escapeCSV(a.region),
      escapeCSV(a.url)
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    // Construct descriptive filename based on active filters
    const dateStr = new Date().toISOString().split('T')[0];
    const filenameSegments: string[] = ["bd-investment-news"];
    
    if (selectedRegions.size > 0) {
      filenameSegments.push(Array.from(selectedRegions).join("-"));
    }
    if (selectedSentiments.size > 0) {
      filenameSegments.push(Array.from(selectedSentiments).join("-"));
    }
    if (magnitudeValue > 0) {
      filenameSegments.push(`min-${magnitudeValue}-${sliderInfo.label.toLowerCase()}`);
    }
    if (searchQuery.trim()) {
      const cleanSearch = searchQuery.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (cleanSearch) {
        filenameSegments.push(`search-${cleanSearch}`);
      }
    }
    filenameSegments.push(dateStr);
    
    link.href = URL.createObjectURL(blob);
    link.download = `${filenameSegments.join("-")}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <InfiniteGridBackground />
      <div className="relative z-10">
        {/* Unsubscribe Confirmation Dialog */}
        <Dialog open={!!unsubscribeEmail} onOpenChange={(open) => { if (!open) handleCancelUnsubscribe(); }}>
          <DialogContent className="sm:max-w-md bg-card border border-border">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold uppercase tracking-widest text-destructive">
                Unsubscribe from Alerts
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
                Are you sure you want to unsubscribe <strong className="text-foreground">{unsubscribeEmail}</strong> from all BIDA climate alert notifications?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={isUnsubscribing}
                onClick={handleCancelUnsubscribe}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isUnsubscribing}
                onClick={handleConfirmUnsubscribe}
                className="text-xs font-semibold gap-1.5"
              >
                {isUnsubscribing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Unsubscribe
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {topRisk && (
          <CriticalAlertBanner item={topRisk} onView={() => window.open(topRisk.url, "_blank")} />
        )}
        <DashboardHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-8xl mx-auto px-6 lg:px-8 py-8 lg:py-10">
        <section className="mb-10">
          <h2 className="text-3xl font-bold mb-2">Global Sentiment Overview</h2>
          <p className="text-muted-foreground max-w-3xl leading-relaxed">
            Real-time intelligence from international media on Bangladesh's
            investment landscape.
          </p>
          <div className="mt-8">
            <SummaryStats />
          </div>
        </section>

        <section>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">
                Concurrent Buzz
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Live international coverage of Bangladesh's investment
                landscape.
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="font-semibold gap-1.5 border-primary/20 hover:border-primary/40 hover:bg-primary/5">
                    <Bell className="w-4 h-4 text-primary" strokeWidth={2} />
                    Set Email Alert
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-card border border-border">
                  <DialogHeader className="border-b pb-3 border-border">
                    <DialogTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                      <BellRing className="w-4 h-4 text-primary animate-pulse" />
                      BIDA Center Alerts
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
                      Receive email briefs and full CSV reports automatically when the index drops below your selected threshold.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="pt-4">
                    <AlertSubscribe onSuccess={() => setIsAlertOpen(false)} />
                  </div>
                </DialogContent>
              </Dialog>

              <Button size="sm" className="font-semibold" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" strokeWidth={2} />
                Export Report
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          <div className="bg-card border border-border shadow-card rounded-xl p-6 mb-8">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 border-b pb-2">
              Filter Intelligence Feed
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Sentiment Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5">
                  <span className="block text-xs font-bold uppercase tracking-wider text-foreground">
                    Sentiment
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-muted-foreground hover:text-foreground transition-colors cursor-help outline-none">
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3 bg-card border border-border text-foreground rounded-lg shadow-lg" side="top" align="start">
                        <div className="space-y-2 text-xs leading-relaxed">
                          <p className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground border-b pb-1">Sentiment Categories</p>
                          <div>
                            <strong className="text-emerald-400">Opportunity:</strong> Positive signals like FDI growth, policy incentives, or infrastructure expansions.
                          </div>
                          <div>
                            <strong className="text-slate-400">Neutral:</strong> Informational announcements or routine reports with no immediate economic impact.
                          </div>
                          <div>
                            <strong className="text-blue-400">Regulation:</strong> Shifts in tariffs, trade policy, compliance, or tax rules.
                          </div>
                          <div>
                            <strong className="text-red-400">Risk / Critical:</strong> Concerns like political disruption, high inflation, energy crises, or delays.
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sentimentFilters.map((f) => {
                    const isActive = selectedSentiments.has(f.key);
                    return (
                      <button
                        key={f.key}
                        onClick={() => toggleSentiment(f.key)}
                        className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider border transition ${
                          isActive
                            ? f.color + " border-current shadow-sm"
                            : "bg-background text-muted-foreground border-transparent hover:border-primary/40 hover:bg-muted"
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Source Region Filter */}
              <div className="space-y-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-foreground">
                  Source Region
                </span>
                <div className="flex flex-wrap gap-2">
                  {regionFilters.map((f) => {
                    const isActive = selectedRegions.has(f.key);
                    const Icon = f.icon;
                    return (
                      <button
                        key={f.key}
                        onClick={() => toggleRegion(f.key)}
                        className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider border transition inline-flex items-center gap-1.5 ${
                          isActive
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background text-muted-foreground border-transparent hover:border-primary/40 hover:bg-muted"
                        }`}
                      >
                        <Icon className="w-3 h-3" strokeWidth={2} />
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Magnitude Slider Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5">
                  <span className="block text-xs font-bold uppercase tracking-wider text-foreground">
                    Impact Magnitude
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-muted-foreground hover:text-foreground transition-colors cursor-help outline-none">
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3 bg-card border border-border text-foreground rounded-lg shadow-lg" side="top" align="start">
                        <div className="space-y-2 text-xs leading-relaxed">
                          <p className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground border-b pb-1">Impact Levels</p>
                          <div>
                            <strong className="text-slate-400">Routine (0–29):</strong> Standard operations, minor local news, or routine releases.
                          </div>
                          <div>
                            <strong className="text-blue-400">Notable (30–69):</strong> Significant domestic policies or mid-tier approvals.
                          </div>
                          <div>
                            <strong className="text-orange-400">Sectoral (70–89):</strong> Major developments affecting entire industrial or financial sectors (e.g. RMG, energy).
                          </div>
                          <div>
                            <strong className="text-red-400">Systemic (90–100):</strong> Country-wide economic shocks, ratings shifts, or high-level policies.
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="relative h-8 flex flex-col justify-between">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={magnitudeValue}
                    onChange={(e) => setMagnitudeValue(Number(e.target.value))}
                    className="w-full h-1.5 mt-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary border border-border"
                  />
                  <div
                    className="absolute bottom-0 transform -translate-x-1/2 bg-primary/10 text-primary border border-primary/20 shadow-sm rounded px-2 py-0.5 text-[10px] font-mono font-bold whitespace-nowrap pointer-events-none"
                    style={{ left: `${magnitudeValue}%` }}
                  >
                    {magnitudeValue}({sliderInfo.label})
                  </div>
                </div>
              </div>

            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-mono">Loading intelligence feed…</span>
            </div>
          ) : newsItems.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-semibold mb-2">No articles match your filters</p>
              <p className="text-sm">
                Try adjusting sentiment or source filters, or broaden your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {newsItems.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </main>
      </div>
    </div>
  );
};

export default Index;
