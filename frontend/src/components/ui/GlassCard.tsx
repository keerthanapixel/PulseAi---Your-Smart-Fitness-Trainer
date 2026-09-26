import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "emerald" | "cyan" | "purple" | "amber" | "none";
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  glow = "none",
  interactive = false,
}) => {
  const glowClasses = {
    none: "",
    emerald: "shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)] hover:border-brand-emerald/40",
    cyan: "shadow-[0_0_30px_-10px_rgba(6,182,212,0.2)] hover:border-brand-cyan/40",
    purple: "shadow-[0_0_30px_-10px_rgba(139,92,246,0.2)] hover:border-brand-purple/40",
    amber: "shadow-[0_0_30px_-10px_rgba(245,158,11,0.2)] hover:border-brand-amber/40",
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        interactive ? "glass-panel-interactive" : "glass-panel"
      } ${glowClasses[glow]} ${className}`}
    >
      {children}
    </div>
  );
};
