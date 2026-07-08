import { useState } from "react";
import { Mail, BellRing, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { subscribeToAlerts } from "@/lib/api";

function getThresholdLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Systemic", color: "text-red-400 border-red-500/20 bg-red-500/5" };
  if (score >= 70) return { label: "Sectoral", color: "text-orange-400 border-orange-500/20 bg-orange-500/5" };
  if (score >= 30) return { label: "Notable", color: "text-blue-400 border-blue-500/20 bg-blue-500/5" };
  return { label: "Routine", color: "text-muted-foreground border-muted-foreground/20 bg-muted-foreground/5" };
}

export function AlertSubscribe() {
  const [email, setEmail] = useState("");
  const [threshold, setThreshold] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email Address",
        description: "Please enter a valid email address before subscribing.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await subscribeToAlerts(email.trim(), threshold);
      toast({
        title: "Alert Registered Successfully",
        description: res.message || `You will be notified when the climate score drops below ${threshold}.`,
      });
      setEmail("");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Subscription Failed",
        description: err.message || "An error occurred while setting up your subscription.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const labelInfo = getThresholdLabel(threshold);

  return (
    <div className="bg-card border border-border shadow-card rounded-xl p-6 flex flex-col justify-between h-full min-h-[268px]">
      <div>
        <div className="flex items-center gap-2 mb-3 border-b pb-2 border-border">
          <BellRing className="w-4 h-4 text-primary animate-pulse" />
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            BIDA Center Alerts
          </h4>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
          Receive email briefs and full CSV reports automatically when the index drops below your selected threshold.
        </p>
      </div>

      <form onSubmit={handleSubscribe} className="space-y-4">
        {/* Email Input */}
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={isLoading}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
            required
          />
        </div>

        {/* Threshold Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider">
            <span className="text-muted-foreground">Threshold Score</span>
            <span className={`px-2 py-0.5 rounded border ${labelInfo.color} font-bold`}>
              {threshold} ({labelInfo.label})
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="99"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            disabled={isLoading}
            className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
          />
        </div>

        {/* Action Button */}
        <Button
          type="submit"
          className="w-full text-xs font-bold font-sans uppercase tracking-wider"
          size="sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : (
            "Set Alert Trigger"
          )}
        </Button>
      </form>
    </div>
  );
}
