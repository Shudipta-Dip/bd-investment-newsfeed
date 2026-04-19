import { AlertOctagon } from "lucide-react";
import type { NewsItem } from "@/data/news";

export const CriticalAlertBanner = ({
  item,
  onView,
}: {
  item: NewsItem;
  onView: () => void;
}) => {
  return (
    <div className="bg-destructive-soft border-l-4 border-destructive px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <AlertOctagon
          className="text-destructive w-5 h-5 shrink-0"
          strokeWidth={2}
        />
        <p className="text-sm font-medium text-foreground truncate">
          <span className="font-bold uppercase font-mono text-xs text-destructive mr-2">
            Critical:
          </span>
          {item.headline}
        </p>
      </div>
      <button
        onClick={onView}
        className="text-xs font-bold uppercase tracking-wider text-destructive hover:underline whitespace-nowrap"
      >
        View Impact →
      </button>
    </div>
  );
};
