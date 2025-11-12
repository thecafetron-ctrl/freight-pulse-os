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
        "glass-panel rounded-2xl p-4 sm:p-6 lg:p-7 transition-all duration-300",
        glow === "orange" && "hover:shadow-[0_0_30px_rgba(255,122,0,0.2)]",
        glow === "cyan" && "hover:shadow-[0_0_30px_rgba(0,230,255,0.2)]",
        className
      )}
    >
      {children}
    </div>
  );
};
