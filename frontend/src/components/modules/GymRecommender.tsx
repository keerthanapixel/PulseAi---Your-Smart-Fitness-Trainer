"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Star, Clock, Trophy, Flame, Dumbbell, ExternalLink, Search, CheckCircle2 } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { api, GymResponse } from "@/lib/api";

const QUICK_CITIES = ["Bangalore", "Chennai", "Mumbai", "Delhi"];

export const GymRecommender: React.FC = () => {
  const [cityInput, setCityInput] = useState<string>("Bangalore");
  const [data, setData] = useState<GymResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [challengeCompleted, setChallengeCompleted] = useState<boolean>(false);

  const fetchGyms = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.getGyms(query);
      setData(res);
    } catch (err) {
      console.error("Failed to fetch gyms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGyms("Bangalore");
  }, []);

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto space-y-3 sm:space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2 tracking-tight">
            Gym Locator & Performance Hub
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
            Discover verified training facilities, daily programming, and community challenges
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchGyms(cityInput);
          }}
          className="flex items-center gap-1.5 sm:gap-2 max-w-md w-full sm:w-auto"
        >
          <div className="relative flex-1">
            <MapPin className="w-3.5 h-3.5 text-brand-emerald absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Enter city or area..."
              className="w-full pl-8 pr-3 py-2 sm:py-2.5 bg-obsidian-900 border border-white/[0.12] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-emerald transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-emerald/90 text-obsidian-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-brand-emerald/20 shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Quick City Filters */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
        <span className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-400 shrink-0">Hubs:</span>
        {QUICK_CITIES.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCityInput(c);
              fetchGyms(c);
            }}
            className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium border transition ${
              cityInput.toLowerCase() === c.toLowerCase()
                ? "bg-brand-emerald/20 text-brand-emerald border-brand-emerald/40 font-bold"
                : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Main Grid: Gym Cards + Routine/Challenge Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6">
        {/* Gym Facility Cards */}
        <div className="lg:col-span-8 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-emerald" />
              <span>Recommended Facilities in {data?.city || "Area"}</span>
            </h3>
            <span className="text-[11px] sm:text-xs text-slate-400 font-mono">
              {data?.gyms.length || 0} gyms verified
            </span>
          </div>

          {loading ? (
            <div className="p-8 sm:p-12 text-center text-slate-400 text-xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-brand-emerald/20 border-t-brand-emerald animate-spin mx-auto mb-2" />
              Searching fitness hubs...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {data?.gyms.map((gym, idx) => (
                <GlassCard key={idx} className="p-3.5 sm:p-5 flex flex-col justify-between" glow="emerald" interactive>
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-white text-base leading-snug">{gym.name}</h4>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-amber/15 text-brand-amber font-mono font-bold text-xs border border-brand-amber/30 shrink-0">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{gym.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-brand-cyan mb-2 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{gym.area}</span>
                    </p>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4">{gym.type}</p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{gym.open_hours}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {gym.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Daily Routine & Performance Challenge */}
        <div className="lg:col-span-4 space-y-3 sm:space-y-4">
          {/* Daily Routine Card */}
          {data?.daily_routine && (
            <GlassCard className="p-3.5 sm:p-5 border-white/[0.12]" glow="cyan">
              <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-brand-cyan" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Routine of the Day
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                  {data.daily_routine.duration_min} min
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">{data.daily_routine.title}</h4>
              <p className="text-[11px] sm:text-xs text-slate-400 mb-3">Level: {data.daily_routine.level}</p>

              <div className="space-y-1.5 sm:space-y-2">
                {data.daily_routine.exercises.map((ex, i) => (
                  <div key={i} className="p-2 sm:p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-xs font-semibold text-slate-200 block">{ex.name}</span>
                    <span className="text-[10px] sm:text-[11px] text-brand-cyan font-mono">{ex.sets}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Performance Challenge Card */}
          {data?.daily_challenge && (
            <GlassCard className="p-3.5 sm:p-5 border-white/[0.12]" glow="amber">
              <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-brand-amber" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Daily Challenge
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-amber/20 text-brand-amber border border-brand-amber/30">
                  +{data.daily_challenge.reward_xp} XP
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-white mb-1.5">{data.daily_challenge.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {data.daily_challenge.description}
              </p>

              <button
                onClick={() => setChallengeCompleted(!challengeCompleted)}
                className={`w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  challengeCompleted
                    ? "bg-brand-emerald text-obsidian-950 shadow-lg shadow-brand-emerald/20"
                    : "bg-brand-amber/20 text-brand-amber border border-brand-amber/40 hover:bg-brand-amber/30"
                }`}
              >
                {challengeCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Challenge Completed! (+250 XP)</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4" />
                    <span>Accept & Track Challenge</span>
                  </>
                )}
              </button>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
