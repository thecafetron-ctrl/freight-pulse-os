import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
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
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src="/logo-white.svg" 
            alt="Structure" 
            className="h-8 w-auto transition-all duration-300 group-hover:opacity-80"
          />
          <span className="text-lg font-semibold text-white sm:text-xl tracking-tight">STRUCTURE</span>
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
                    : "text-white/50 hover:bg-white/5 hover:text-white",
                )}
              >
                {item.label}
                {isActive && (
                  <div className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Status Indicator */}
        <div className="hidden shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 sm:flex">
          <div className="h-2 w-2 animate-pulse-glow rounded-full bg-white" />
          <span className="text-xs font-medium text-white/60 sm:text-sm">AI Active</span>
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
          <SheetContent side="right" className="flex h-full w-full flex-col gap-6 bg-black px-6 pb-10 pt-12 text-white sm:max-w-xs border-l border-white/10">
            <div className="flex items-center gap-3">
              <img 
                src="/logo-white.svg" 
                alt="Structure" 
                className="h-8 w-auto"
              />
              <span className="text-lg font-semibold tracking-tight">STRUCTURE</span>
            </div>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SheetClose asChild key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "rounded-xl border px-4 py-3 text-base font-medium transition-all duration-300",
                        isActive
                          ? "border-white/30 bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                          : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white",
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                );
              })}
            </div>
            <div className="mt-auto rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse-glow rounded-full bg-white" />
                <span className="font-medium uppercase tracking-wide text-white/70">AI Active</span>
              </div>
              <p className="mt-2 leading-relaxed text-white/40">
                Your demo environment responds in real time. Explore dashboards, quotes, and route planning.
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};
