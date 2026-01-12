import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: "orange" | "cyan" | "none";
  style?: CSSProperties;
}

export const GlassCard = ({ children, className, glow = "none", style }: GlassCardProps) => {
  return (
    <div
      style={style}
      className={cn(
        "group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] via-white/[0.02] to-white/[0.01] p-4 sm:p-6 lg:p-7 backdrop-blur-md transition-all duration-300 ease-out overflow-hidden",
        "before:absolute before:inset-0 before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-300",
        "after:absolute after:inset-0 after:rounded-2xl after:pointer-events-none after:opacity-0 after:transition-opacity after:duration-400",
        glow === "orange" && [
          "hover:border-white/25 hover:shadow-[0_0_60px_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.4)]",
          "hover:scale-[1.01] hover:-translate-y-0.5",
          "before:bg-gradient-to-br before:from-white/[0.08] before:via-transparent before:to-transparent",
          "hover:before:opacity-100",
          "after:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.15),transparent_70%)]",
          "hover:after:opacity-100",
        ],
        glow === "cyan" && [
          "hover:border-white/20 hover:shadow-[0_0_50px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.4)]",
          "hover:scale-[1.01] hover:-translate-y-0.5",
          "before:bg-gradient-to-br before:from-white/[0.06] before:via-transparent before:to-transparent",
          "hover:before:opacity-100",
          "after:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_70%)]",
          "hover:after:opacity-100",
        ],
        className
      )}
    >
      <div className="relative z-10">{children}</div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
    </div>
  );
};
