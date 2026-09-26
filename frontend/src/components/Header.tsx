"use client";

import React, { useEffect, useState } from "react";
import { Volume2, VolumeX, Activity, AlertCircle, Dumbbell } from "lucide-react";
import { api } from "@/lib/api";

interface HeaderProps {
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  setSoundEnabled,
  title,
  subtitle,
}) => {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      try {
        await api.checkHealth();
        if (isMounted) setBackendOnline(true);
      } catch (e) {
        if (isMounted) setBackendOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="w-full flex items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3.5 border-b border-white/[0.08] bg-obsidian-900/80 backdrop-blur-xl shrink-0">
      {/* Left side: Brand Icon on mobile + Title & Subtitle */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="lg:hidden w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-emerald to-brand-cyan flex items-center justify-center shrink-0 shadow-md shadow-brand-emerald/20">
          <Dumbbell className="w-4 h-4 text-obsidian-950 stroke-[2.5]" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="lg:hidden text-xs font-mono font-black text-brand-emerald">
              PULSE
            </span>
            <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white truncate">
              {title}
            </h1>
          </div>
          <p className="hidden sm:block text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>
        </div>
      </div>

      {/* Right side: Status and Sound Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Backend API status badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-mono border transition-colors ${
            backendOnline === true
              ? "bg-brand-emerald/10 text-brand-emerald border-brand-emerald/30"
              : backendOnline === false
              ? "bg-brand-rose/10 text-brand-rose border-brand-rose/30"
              : "bg-slate-800 text-slate-400 border-slate-700"
          }`}
        >
          {backendOnline === true ? (
            <>
              <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse shrink-0" />
              <span className="hidden sm:inline">FastAPI Connected</span>
              <span className="sm:hidden font-semibold">Online</span>
            </>
          ) : backendOnline === false ? (
            <>
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span className="hidden sm:inline">FastAPI Offline</span>
              <span className="sm:hidden font-semibold">Offline</span>
            </>
          ) : (
            <>
              <Activity className="w-3 h-3 animate-spin shrink-0" />
              <span className="hidden sm:inline">Connecting...</span>
              <span className="sm:hidden font-semibold">Sync</span>
            </>
          )}
        </div>

        {/* Audio Coach Voice Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium border transition-all ${
            soundEnabled
              ? "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30 hover:bg-brand-cyan/25"
              : "bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-slate-200"
          }`}
          title={soundEnabled ? "Audio Coach Voice: ON" : "Audio Coach Voice: MUTED"}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Voice Coach</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Muted</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
