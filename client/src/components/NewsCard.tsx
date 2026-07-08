import { Clock, Sparkles } from "lucide-react";
import { SentimentBadge } from "./SentimentBadge";
import type { NewsItem } from "@/data/news";

const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 3600000;
  if (diff < 1) return `${Math.max(1, Math.round(diff * 60))}M AGO`;
  if (diff < 24) return `${Math.round(diff)}H AGO`;
  return `${Math.round(diff / 24)}D AGO`;
};

/** Convert impact score to a human-readable magnitude label */
function impactLabel(score: number): { text: string; color: string } {
  if (score >= 90) return { text: "SYSTEMIC", color: "text-red-400" };
  if (score >= 70) return { text: "SECTORAL", color: "text-orange-400" };
  if (score >= 30) return { text: "NOTABLE", color: "text-blue-400" };
  return { text: "ROUTINE", color: "text-muted-foreground" };
}

export const NewsCard = ({
  item,
}: {
  item: NewsItem;
}) => {
  const magnitude = impactLabel(item.impact);
  const isGlobal = item.region !== "Bangladesh";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group text-left bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all block"
    >
      <div className="flex justify-between items-start mb-4 gap-3">
        <SentimentBadge sentiment={item.sentiment} />
        <span className="text-[10px] font-mono text-muted-foreground inline-flex items-center gap-1 whitespace-nowrap">
          <Clock className="w-3 h-3" strokeWidth={2} />
          {timeAgo(item.publishedAt)} · {item.source.toUpperCase()}
        </span>
      </div>
      <h3 className="text-lg font-bold leading-snug mb-3 text-foreground group-hover:text-primary transition-colors">
        {item.headline}
      </h3>

      {/* Intelligence Note */}
      {item.aiRationale && (
        <div className="flex items-start gap-2 mb-3 px-3 py-2 rounded-md bg-primary/5 border border-primary/10">
          <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" strokeWidth={2} />
          <p className="text-xs text-primary font-medium leading-relaxed">
            {item.aiRationale}
          </p>
        </div>
      )}

      <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">
        {item.snippet}
      </p>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono font-bold uppercase ${magnitude.color}`}>
            {magnitude.text}
          </span>
          <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${item.impact}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            {item.impact}
          </span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">
          {item.region}
        </span>
      </div>
    </a>
  );
};
