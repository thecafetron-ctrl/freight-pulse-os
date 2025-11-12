import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlowButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export const GlowButton = ({ 
  children, 
  className, 
  variant = "primary",
  onClick,
  type = "button",
}: GlowButtonProps) => {
  const variants = {
    primary: "bg-gradient-to-r from-[hsl(var(--orange-glow))] to-[hsl(var(--orange-bright))] text-white hover:shadow-[0_0_30px_rgba(255,122,0,0.4)] hover:scale-105",
    secondary: "bg-[hsl(var(--cyan-glow))] text-[hsl(var(--navy-deep))] hover:shadow-[0_0_30px_rgba(0,230,255,0.4)] hover:scale-105",
    outline: "border-2 border-[hsl(var(--orange-glow))] text-[hsl(var(--orange-glow))] hover:bg-[hsl(var(--orange-glow))] hover:text-white hover:shadow-[0_0_20px_rgba(255,122,0,0.3)]"
  };

  return (
    <button
      onClick={onClick}
      type={type}
      className={cn(
        "inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 sm:w-auto sm:px-6 sm:py-3 sm:text-base",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};
