import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { CriticalAlertBanner } from "@/components/CriticalAlertBanner";
import { SummaryStats } from "@/components/SummaryStats";
import { NewsCard } from "@/components/NewsCard";
import { ActionDrawer } from "@/components/ActionDrawer";
import { Button } from "@/components/ui/button";
import { Filter, Download } from "lucide-react";
import { newsItems, dashboardSummary, type NewsItem, type Sentiment } from "@/data/news";

type FilterKey = "all" | Sentiment;

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "negative", label: "Critical" },
  { key: "positive", label: "Growth" },
  { key: "neutral", label: "Policy" },
];

const Index = () => {
  const [active, setActive] = useState<NewsItem | null>(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");

  const topCritical = useMemo(
    () =>
      [...newsItems]
        .filter((n) => n.sentiment === "negative")
        .sort((a, b) => b.impact - a.impact)[0],
    [],
  );

  const visible = useMemo(
    () =>
      filter === "all"
        ? newsItems
        : newsItems.filter((n) => n.sentiment === filter),
    [filter],
  );

  const openItem = (item: NewsItem) => {
    setActive(item);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {topCritical && (
        <CriticalAlertBanner item={topCritical} onView={() => openItem(topCritical)} />
      )}
      <DashboardHeader />

      <main className="max-w-8xl mx-auto px-6 lg:px-8 py-8 lg:py-10">
        <section className="mb-10">
          <h2 className="text-3xl font-bold mb-2">Global Sentiment Overview</h2>
          <p className="text-muted-foreground max-w-3xl leading-relaxed">
            Today's global buzz is{" "}
            <span className="font-semibold text-foreground">
              {dashboardSummary.positivePct}% positive
            </span>
            , primarily driven by infrastructure progress at Matarbari.{" "}
            <span className="text-destructive font-semibold">
              {dashboardSummary.criticalCount} negative narratives
            </span>{" "}
            require immediate attention.
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
              <Button variant="outline" size="sm" className="font-semibold">
                <Filter className="w-4 h-4 mr-2" strokeWidth={2} />
                Filter
              </Button>
              <Button size="sm" className="font-semibold">
                <Download className="w-4 h-4 mr-2" strokeWidth={2} />
                Export Report
              </Button>
            </div>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider border transition ${
                  filter === f.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visible.map((item) => (
              <NewsCard key={item.id} item={item} onOpen={openItem} />
            ))}
          </div>
        </section>
      </main>

      <ActionDrawer item={active} open={open} onOpenChange={setOpen} />
    </div>
  );
};

export default Index;
