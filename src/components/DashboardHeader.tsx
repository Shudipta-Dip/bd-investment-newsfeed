import { Search, Bell } from "lucide-react";

export const DashboardHeader = () => {
  return (
    <header className="border-b border-border bg-card px-6 lg:px-8 py-4 flex justify-between items-center gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold text-sm tracking-tight">
          BD
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight leading-none">
            Intelligence Command
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
            placeholder="Search global buzz…"
            className="pl-9 pr-4 py-2 bg-background border border-input rounded-md text-sm w-72 focus:ring-2 focus:ring-ring focus:border-ring outline-none transition"
          />
        </div>
        <button className="relative p-2 rounded-md hover:bg-secondary transition">
          <Bell className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>
        <div className="w-9 h-9 bg-secondary rounded-full border-2 border-card shadow-card flex items-center justify-center text-xs font-bold text-muted-foreground">
          MR
        </div>
      </div>
    </header>
  );
};
