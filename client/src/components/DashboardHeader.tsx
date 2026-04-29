import { Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export const DashboardHeader = ({
  searchQuery = "",
  setSearchQuery = (val: string) => {},
}: {
  searchQuery?: string;
  setSearchQuery?: (val: string) => void;
}) => {
  return (
    <header className="border-b border-border bg-card px-6 lg:px-8 py-4 flex justify-between items-center gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <img
          src="/newsfeed_favicon.svg"
          alt="BD Investment Newsfeed"
          className="w-9 h-9 rounded-md object-cover"
        />
        <div>
          <h1 className="text-base font-bold tracking-tight leading-none">
            BD Investment Newsfeed
          </h1>
          <p className="text-[10px] font-mono uppercase text-muted-foreground mt-1">
            BIDA • BEZA • PPPA
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            strokeWidth={2}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search global buzz…"
            className="pl-9 pr-4 py-2 bg-background border border-input rounded-md text-sm w-72 focus:ring-2 focus:ring-ring focus:border-ring outline-none transition"
          />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};
