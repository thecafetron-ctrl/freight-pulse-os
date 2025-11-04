import { Link, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard" },
  { path: "/quotes", label: "Quotes" },
  { path: "/load-matching", label: "Load Matching" },
  { path: "/documents", label: "Documents" },
  { path: "/forecasting", label: "Forecasting" },
  { path: "/analytics", label: "Analytics" },
  { path: "/route-planning", label: "Route Planning" },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="w-full bg-[hsl(var(--navy-medium))] border-b border-[hsl(var(--border))] sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
      <div className="max-w-[1800px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--orange-glow))] to-[hsl(var(--orange-bright))] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">McCarthy AI</span>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative",
                    isActive
                      ? "text-white"
                      : "text-[hsl(var(--text-secondary))] hover:text-white hover:bg-white/5"
                  )}
                >
                  {item.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--orange-glow))] rounded-full shadow-[0_0_10px_rgba(255,122,0,0.5)]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--orange-glow))] animate-pulse-glow" />
            <span className="text-sm text-[hsl(var(--text-secondary))]">AI Active</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
