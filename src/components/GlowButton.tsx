import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlowButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  onClick?: () => void;
}

export const GlowButton = ({ 
  children, 
  className, 
  variant = "primary",
  onClick 
}: GlowButtonProps) => {
  const variants = {
    primary: "bg-gradient-to-r from-[hsl(var(--orange-glow))] to-[hsl(var(--orange-bright))] text-white hover:shadow-[0_0_30px_rgba(255,122,0,0.4)] hover:scale-105",
    secondary: "bg-[hsl(var(--cyan-glow))] text-[hsl(var(--navy-deep))] hover:shadow-[0_0_30px_rgba(0,230,255,0.4)] hover:scale-105",
    outline: "border-2 border-[hsl(var(--orange-glow))] text-[hsl(var(--orange-glow))] hover:bg-[hsl(var(--orange-glow))] hover:text-white hover:shadow-[0_0_20px_rgba(255,122,0,0.3)]"
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-3 rounded-xl font-semibold transition-all duration-300",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};
