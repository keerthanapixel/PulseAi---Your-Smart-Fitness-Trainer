"use client";

import React from "react";
import { Camera, Bot, Salad, MapPin, Sparkles, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

export type ModuleType = "pose" | "chat" | "diet" | "gym";

interface NavigationProps {
  activeModule: ModuleType;
  setActiveModule: (m: ModuleType) => void;
}

const NAV_ITEMS: {
  id: ModuleType;
  label: string;
  mobileLabel: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "pose", label: "AI Pose Coach", mobileLabel: "Coach", tag: "Vision AI", icon: Camera },
  { id: "chat", label: "Virtual Gym Buddy", mobileLabel: "Buddy", tag: "Assistant", icon: Bot },
  { id: "diet", label: "AI Dietician", mobileLabel: "Diet", tag: "Nutrition", icon: Salad },
  { id: "gym", label: "Gym Recommender", mobileLabel: "Gyms", tag: "Locator", icon: MapPin },
];

export const Navigation: React.FC<NavigationProps> = ({ activeModule, setActiveModule }) => {
  return (
    <>
      {/* ================= DESKTOP SIDEBAR (lg:flex) ================= */}
      <aside className="hidden lg:flex w-72 bg-obsidian-900/90 min-h-screen border-r border-white/[0.08] p-6 flex-col justify-between backdrop-blur-2xl shrink-0">
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-emerald to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-emerald/20">
                <Dumbbell className="w-5 h-5 text-obsidian-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    PULSE
                  </span>
                  <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded-full bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30">
                    AI
                  </span>
                </div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Fitness Intelligence
                </p>
              </div>
            </div>
          </div>

          {/* Navigation List */}
          <nav className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`group relative flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "text-white bg-white/[0.08] shadow-md shadow-black/40 border border-white/[0.12]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isActive
                          ? "bg-brand-emerald/20 text-brand-emerald"
                          : "bg-white/[0.03] text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>

                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md ${
                      isActive
                        ? "bg-brand-emerald/20 text-brand-emerald font-semibold"
                        : "text-slate-400 group-hover:text-slate-400"
                    }`}
                  >
                    {item.tag}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-emerald rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info Card */}
        <div className="pt-6 border-t border-white/[0.08]">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-emerald animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-300">Hackathon Mode</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Zero-latency client-side MediaPipe vision with unified FastAPI intelligence.
            </p>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE BOTTOM NAVIGATION (lg:hidden) ================= */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-obsidian-950/95 backdrop-blur-2xl border-t border-white/[0.08] px-2 py-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(0,0,0,0.8)]">
        <nav className="flex items-center justify-around gap-1 max-w-md mx-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`flex-1 relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-brand-emerald font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <div
                  className={`w-9 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-brand-emerald/20 text-brand-emerald shadow-md shadow-brand-emerald/10"
                      : "text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 font-medium leading-none">
                  {item.mobileLabel}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="mobileActiveDot"
                    className="w-1 h-1 rounded-full bg-brand-emerald mt-1"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
