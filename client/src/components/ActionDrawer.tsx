import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { SentimentBadge } from "./SentimentBadge";
import { toast } from "sonner";
import { updateArticle } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import type { NewsItem } from "@/data/news";
import {
  AlertOctagon,
  TrendingUp,
  ExternalLink,
  Send,
  Archive,
  CheckCircle2,
  Loader2,
} from "lucide-react";

type Props = {
  item: NewsItem | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
};

export const ActionDrawer = ({ item, open, onOpenChange }: Props) => {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  if (!item) return null;

  const log = async (label: string) => {
    setSaving(true);
    try {
      await updateArticle(item._dbId, {
        action_taken: true,
        action_note: `[${label}] ${note}`.trim(),
      });
      // Refresh the news list so the UI reflects the change
      queryClient.invalidateQueries({ queryKey: ["news"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success(`${label} logged`, {
        description: `Action recorded against "${item.headline.slice(0, 48)}…"`,
      });
    } catch {
      toast.error("Failed to save action", {
        description: "Check your connection and try again.",
      });
    } finally {
      setSaving(false);
      setNote("");
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-3 text-left">
          <div className="flex items-center justify-between">
            <SentimentBadge sentiment={item.sentiment} />
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              {item.source} • {item.region}
            </span>
          </div>
          <SheetTitle className="text-2xl leading-snug">
            {item.headline}
          </SheetTitle>
          <SheetDescription className="text-base leading-relaxed text-muted-foreground">
            {item.snippet}
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="rounded-lg border border-border p-4">
            <p className="text-[10px] font-mono uppercase text-muted-foreground">
              Narrative Impact
            </p>
            <p className="text-2xl font-bold text-primary mt-1">
              {item.impact}
              <span className="text-sm text-muted-foreground font-mono">
                /100
              </span>
            </p>
            <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${item.impact}%` }}
              />
            </div>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-[10px] font-mono uppercase text-muted-foreground">
              Status
            </p>
            <p className="text-2xl font-bold mt-1 inline-flex items-center gap-1">
              {item._actionTaken ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-positive" strokeWidth={2} />
                  Handled
                </>
              ) : (
                <>
                  <AlertOctagon className="w-5 h-5 text-destructive" strokeWidth={2} />
                  Pending
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {item._actionTaken ? "Action was taken" : "No action logged yet"}
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-3">
          <p className="text-sm font-semibold inline-flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-primary" strokeWidth={2} />
            Log Action
          </p>
          <Textarea
            placeholder="Note the response taken (e.g., clarification drafted, journalist contacted)…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[110px]"
          />
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="destructive"
              className="font-bold"
              disabled={saving}
              onClick={() => log("Correction needed")}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" strokeWidth={2} />
              )}
              Draft Response
            </Button>
            <Button
              className="font-bold"
              disabled={saving}
              onClick={() => log("Action")}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" strokeWidth={2} />
              Mark Handled
            </Button>
            <Button
              variant="outline"
              className="font-bold"
              disabled={saving}
              onClick={() => log("Share signal")}
            >
              <TrendingUp className="w-4 h-4 mr-2" strokeWidth={2} />
              Share Signal
            </Button>
            <Button
              variant="outline"
              className="font-bold"
              disabled={saving}
              onClick={() => log("Archived")}
            >
              <Archive className="w-4 h-4 mr-2" strokeWidth={2} />
              Archive
            </Button>
          </div>
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="w-full font-mono text-xs">
                <ExternalLink className="w-3 h-3 mr-2" strokeWidth={2} />
                OPEN ORIGINAL SOURCE
              </Button>
            </a>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
