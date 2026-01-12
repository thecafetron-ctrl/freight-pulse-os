import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlowButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export const GlowButton = ({ 
  children, 
  className, 
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
}: GlowButtonProps) => {
  const variants = {
    primary: [
      "relative overflow-hidden",
      "bg-gradient-to-r from-white via-white to-white/95 text-black",
      "shadow-[0_4px_20px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.5)]",
      "hover:shadow-[0_0_40px_rgba(255,255,255,0.4),0_8px_32px_rgba(255,255,255,0.2),inset_0_1px_0_rgba(255,255,255,0.6)]",
      "hover:scale-[1.03] hover:-translate-y-0.5",
      "active:scale-[0.98] active:translate-y-0",
      "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
      "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500",
    ],
    secondary: [
      "relative overflow-hidden",
      "bg-gradient-to-br from-white/10 via-white/8 to-white/5 text-white",
      "border border-white/20 backdrop-blur-sm",
      "shadow-[0_4px_20px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.1)]",
      "hover:bg-gradient-to-br hover:from-white/20 hover:via-white/15 hover:to-white/10",
      "hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.15),0_8px_32px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]",
      "hover:scale-[1.03] hover:-translate-y-0.5",
      "active:scale-[0.98] active:translate-y-0",
      "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
      "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500",
    ],
    outline: [
      "relative overflow-hidden",
      "border-2 border-white/30 text-white backdrop-blur-sm",
      "bg-gradient-to-br from-transparent via-white/5 to-transparent",
      "shadow-[0_4px_20px_rgba(255,255,255,0.05)]",
      "hover:bg-gradient-to-br hover:from-white hover:via-white hover:to-white/95 hover:text-black",
      "hover:border-white hover:shadow-[0_0_30px_rgba(255,255,255,0.3),0_8px_32px_rgba(255,255,255,0.15)]",
      "hover:scale-[1.03] hover:-translate-y-0.5",
      "active:scale-[0.98] active:translate-y-0",
      "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
      "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500",
    ]
  };

  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out sm:w-auto sm:px-6 sm:py-3 sm:text-base",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:shadow-none",
        variants[variant],
        className
      )}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};
