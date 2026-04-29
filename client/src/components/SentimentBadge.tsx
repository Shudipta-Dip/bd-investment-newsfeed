import { cn } from "@/lib/utils";
import type { Sentiment } from "@/data/news";

const map: Record<Sentiment, { label: string; cls: string }> = {
  opportunity: { label: "OPPORTUNITY", cls: "bg-emerald-500/10 text-emerald-500" },
  risk: { label: "RISK", cls: "bg-red-500/10 text-red-500" },
  regulation: { label: "REGULATION", cls: "bg-blue-500/10 text-blue-500" },
};

export const SentimentBadge = ({
  sentiment,
  label,
  className,
}: {
  sentiment: Sentiment;
  label?: string;
  className?: string;
}) => {
  const entry = map[sentiment] || map.regulation;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded font-mono font-bold text-[10px] tracking-wider uppercase",
        entry.cls,
        className,
      )}
    >
      {label ?? entry.label}
    </span>
  );
};
