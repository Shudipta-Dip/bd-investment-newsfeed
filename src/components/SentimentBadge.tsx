import { cn } from "@/lib/utils";
import type { Sentiment } from "@/data/news";

const map: Record<Sentiment, { label: string; cls: string }> = {
  negative: { label: "CRITICAL", cls: "bg-negative-soft text-destructive" },
  positive: { label: "GROWTH", cls: "bg-positive-soft text-positive" },
  neutral: { label: "POLICY", cls: "bg-neutral-soft text-neutral" },
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
  const { label: defaultLabel, cls } = map[sentiment];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded font-mono font-bold text-[10px] tracking-wider uppercase",
        cls,
        className,
      )}
    >
      {label ?? defaultLabel}
    </span>
  );
};
