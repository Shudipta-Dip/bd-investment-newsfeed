import { Clock } from "lucide-react";
import { SentimentBadge } from "./SentimentBadge";
import type { NewsItem } from "@/data/news";

const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 3600000;
  if (diff < 1) return `${Math.max(1, Math.round(diff * 60))}M AGO`;
  if (diff < 24) return `${Math.round(diff)}H AGO`;
  return `${Math.round(diff / 24)}D AGO`;
};

export const NewsCard = ({
  item,
  onOpen,
}: {
  item: NewsItem;
  onOpen: (item: NewsItem) => void;
}) => {
  return (
    <button
      onClick={() => onOpen(item)}
      className="group text-left bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all"
    >
      <div className="flex justify-between items-start mb-4 gap-3">
        <SentimentBadge sentiment={item.sentiment} />
        <span className="text-[10px] font-mono text-muted-foreground inline-flex items-center gap-1 whitespace-nowrap">
          <Clock className="w-3 h-3" strokeWidth={2} />
          {timeAgo(item.publishedAt)} • {item.source.toUpperCase()}
        </span>
      </div>
      <h3 className="text-lg font-bold leading-snug mb-3 text-foreground group-hover:text-primary transition-colors">
        {item.headline}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">
        {item.snippet}
      </p>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">
            Impact
          </span>
          <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${item.impact}%` }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-foreground">
            {item.impact}
          </span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">
          {item.region}
        </span>
      </div>
    </button>
  );
};
