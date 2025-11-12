import { Link, useLocation } from "react-router-dom";
import { Menu, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const navItems = [
  { path: "/", label: "Dashboard" },
  { path: "/quotes", label: "Quotes" },
  { path: "/load-matching", label: "Load Matching" },
  { path: "/documents", label: "Documents" },
  { path: "/forecasting", label: "Forecasting" },
  { path: "/analytics", label: "Analytics" },
    { path: "/lead-generation", label: "AI Lead Generation" },
  { path: "/route-planning", label: "Route Planning" },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--navy-medium))]/95 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--orange-glow))] to-[hsl(var(--orange-bright))] shadow-[0_0_25px_rgba(255,122,0,0.35)]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white sm:text-xl">McCarthy AI</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "text-white"
                    : "text-[hsl(var(--text-secondary))] hover:bg-white/5 hover:text-white",
                )}
              >
                {item.label}
                {isActive && (
                  <div className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-[hsl(var(--orange-glow))] shadow-[0_0_12px_rgba(255,122,0,0.6)]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Status Indicator */}
        <div className="hidden shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 sm:flex">
          <div className="h-2 w-2 animate-pulse-glow rounded-full bg-[hsl(var(--orange-glow))]" />
          <span className="text-xs font-medium text-[hsl(var(--text-secondary))] sm:text-sm">AI Active</span>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 lg:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex h-full w-full flex-col gap-6 bg-[hsl(var(--navy-medium))] px-6 pb-10 pt-12 text-white sm:max-w-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--orange-glow))] to-[hsl(var(--orange-bright))] shadow-[0_0_25px_rgba(255,122,0,0.35)]">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold">McCarthy AI</span>
            </div>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SheetClose asChild key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "rounded-xl border px-4 py-3 text-base font-medium transition-all",
                        isActive
                          ? "border-[hsl(var(--orange-glow))] bg-[hsl(var(--orange-glow))]/20 text-white shadow-[0_0_20px_rgba(255,122,0,0.3)]"
                          : "border-white/10 bg-white/5 text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--orange-glow))]/40 hover:text-white",
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                );
              })}
            </div>
            <div className="mt-auto rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[hsl(var(--text-secondary))]">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse-glow rounded-full bg-[hsl(var(--orange-glow))]" />
                <span className="font-medium uppercase tracking-wide text-white/80">AI Active</span>
              </div>
              <p className="mt-2 leading-relaxed text-white/60">
                Your investor demo environment responds in real time. Explore dashboards, quotes, and route planning with a touch.
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};
