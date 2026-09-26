"use client";

import React, { useState } from "react";
import {
  Salad,
  Sparkles,
  Scale,
  Flame,
  CheckSquare,
  Square,
  Copy,
  Check,
  Target,
  PieChart,
  Droplets,
  Activity,
  Wheat,
  Clock,
  Utensils
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { api, DietResponse } from "@/lib/api";

export const Dietician: React.FC = () => {
  const [weight, setWeight] = useState<number>(72);
  const [height, setHeight] = useState<number>(176);
  const [goal, setGoal] = useState<string>("gain");
  const [preference, setPreference] = useState<string>("vegan");
  const [calories, setCalories] = useState<number>(2400);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DietResponse | null>(null);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [copied, setCopied] = useState<boolean>(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const data = await api.calculateDiet({
        weight_kg: Number(weight),
        height_cm: Number(height),
        goal,
        preference,
        target_calories: Number(calories),
      });
      setResult(data);
      setCheckedItems({});
    } catch (err: any) {
      console.error("Diet calculation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const copyGroceryList = () => {
    if (!result?.grocery) return;
    const text = result.grocery.map((g) => `- ${g}`).join("\n");
    navigator.clipboard.writeText(`🛒 Macro Grocery List:\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBmiBadge = (category: string) => {
    switch (category) {
      case "Underweight":
        return "bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40";
      case "Normal weight":
        return "bg-brand-emerald/20 text-brand-emerald border-brand-emerald/40";
      case "Overweight":
        return "bg-brand-amber/20 text-brand-amber border-brand-amber/40";
      default:
        return "bg-brand-rose/20 text-brand-rose border-brand-rose/40";
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto space-y-3 sm:space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2 tracking-tight">
            AI Clinical Dietician & Nutrition
            <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30">
              Mifflin-St Jeor
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
            Portion-specific meal breakdowns, clinical BMR/TDEE baselines, and Vegan/Vegetarian/Non-Veg optimization
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6">
        {/* Input Configuration Card */}
        <div className="lg:col-span-5">
          <GlassCard className="p-3.5 sm:p-6 border-white/[0.12] shadow-xl">
            <div className="flex items-center gap-2 mb-3.5 sm:mb-6">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-brand-emerald" />
              <h3 className="text-sm sm:text-base font-bold text-white">Biometric Parameters</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
              {/* Weight Slider & Input */}
              <div>
                <div className="flex justify-between text-xs mb-1 sm:mb-2">
                  <span className="font-semibold text-slate-300">Body Weight</span>
                  <span className="font-mono text-brand-emerald font-bold">{weight} kg</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="160"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full accent-brand-emerald h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Height Slider & Input */}
              <div>
                <div className="flex justify-between text-xs mb-1 sm:mb-2">
                  <span className="font-semibold text-slate-300">Height</span>
                  <span className="font-mono text-brand-cyan font-bold">{height} cm</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="220"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full accent-brand-cyan h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Fitness Goal Segmented Control */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Fitness Goal</label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {[
                    { id: "lose", label: "Fat Loss" },
                    { id: "maintain", label: "Maintain" },
                    { id: "gain", label: "Hypertrophy" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGoal(g.id)}
                      className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-xs font-semibold transition-all border ${
                        goal === g.id
                          ? "bg-brand-emerald text-obsidian-950 border-brand-emerald font-bold shadow-lg shadow-brand-emerald/20"
                          : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white hover:bg-white/[0.06]"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Preference: Added VEGAN Option */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Dietary Preference (Includes Vegan)
                </label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {[
                    { id: "veg", label: "Vegetarian" },
                    { id: "vegan", label: "Vegan" },
                    { id: "non-veg", label: "Non-Veg" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPreference(p.id)}
                      className={`py-1.5 sm:py-2 px-2 rounded-xl text-xs font-semibold transition-all border ${
                        preference === p.id
                          ? "bg-brand-cyan text-obsidian-950 border-brand-cyan font-bold shadow-lg shadow-brand-cyan/20"
                          : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white hover:bg-white/[0.06]"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 font-mono">
                  {preference === "vegan" && "100% plant-based: Tofu, Tempeh, Lentils, Seeds (No Dairy/Eggs)"}
                  {preference === "veg" && "Lacto-Vegetarian: Paneer, Greek Yogurt, Dal, Oats, Quinoa"}
                  {preference === "non-veg" && "High-Bioavailability: Chicken Breast, Salmon, Eggs, Whey"}
                </p>
              </div>

              {/* Target Calories Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1 sm:mb-2">
                  <span className="font-semibold text-slate-300">Daily Calorie Target</span>
                  <span className="font-mono text-brand-amber font-bold">{calories} kcal</span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="4200"
                  step="50"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full accent-brand-amber h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3.5 rounded-xl bg-gradient-to-r from-brand-emerald to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-obsidian-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-brand-emerald/20 transition active:scale-98"
              >
                {loading ? (
                  <span className="animate-spin">🌀</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Precision Meal Plan</span>
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Results & Glassmorphism Dashboard */}
        <div className="lg:col-span-7 space-y-4">
          {!result && !loading && (
            <GlassCard className="p-12 text-center flex flex-col items-center justify-center border-dashed border-white/[0.1]">
              <Salad className="w-12 h-12 text-slate-600 mb-3" />
              <h4 className="text-base font-bold text-white mb-1">No Profile Generated</h4>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Select your biometrics and choose between Vegetarian, Vegan, or Non-Vegetarian to view your tailored portions, macros, and grocery checklist.
              </p>
              <button
                onClick={() => handleSubmit()}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-brand-emerald border border-white/[0.08] transition"
              >
                Generate Vegan Sample Plan
              </button>
            </GlassCard>
          )}

          {result && (
            <>
              {/* Clinical Metrics Row: BMI, BMR, TDEE, Water, Fiber */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <GlassCard className="p-2.5 sm:p-3.5" glow="emerald">
                  <div className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-400">BMI Score</div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">{result.bmi}</div>
                  <div
                    className={`text-[8px] sm:text-[9px] font-mono font-bold uppercase mt-1 px-1.5 py-0.5 rounded border inline-block ${getBmiBadge(
                      result.bmi_category
                    )}`}
                  >
                    {result.bmi_category}
                  </div>
                </GlassCard>

                <GlassCard className="p-2.5 sm:p-3.5" glow="cyan">
                  <div className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-brand-cyan" />
                    <span>BMR Baseline</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">{result.bmr_kcal}</div>
                  <div className="text-[8px] sm:text-[9px] text-slate-400 font-mono mt-0.5">kcal basal rate</div>
                </GlassCard>

                <GlassCard className="p-2.5 sm:p-3.5" glow="amber">
                  <div className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-brand-amber" />
                    <span>TDEE Burn</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">{result.tdee_kcal}</div>
                  <div className="text-[8px] sm:text-[9px] text-slate-400 font-mono mt-0.5">kcal expenditure</div>
                </GlassCard>

                <GlassCard className="p-2.5 sm:p-3.5" glow="none">
                  <div className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-brand-cyan" />
                    <span>Daily Water</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">{result.water_liters} <span className="text-xs text-slate-400 font-normal">L</span></div>
                  <div className="text-[8px] sm:text-[9px] text-brand-cyan font-mono mt-0.5">+{result.fiber_g}g fiber goal</div>
                </GlassCard>
              </div>

              {/* Macros Breakdown Cards */}
              <GlassCard className="p-3.5 sm:p-5 border-white/[0.12]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-brand-amber" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Daily Macronutrient Targets
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-brand-amber">
                    {result.macros.calories} kcal
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                    <span className="text-[9px] sm:text-[10px] uppercase font-mono text-brand-emerald font-bold">Protein</span>
                    <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">{result.macros.protein_g}g</div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono mt-0.5">
                      {Math.round((result.macros.protein_g * 4 * 100) / result.macros.calories)}% kcal
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                    <span className="text-[9px] sm:text-[10px] uppercase font-mono text-brand-cyan font-bold">Carbs</span>
                    <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">{result.macros.carbs_g}g</div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono mt-0.5">
                      {Math.round((result.macros.carbs_g * 4 * 100) / result.macros.calories)}% kcal
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                    <span className="text-[9px] sm:text-[10px] uppercase font-mono text-brand-amber font-bold">Fats</span>
                    <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">{result.macros.fats_g}g</div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono mt-0.5">
                      {Math.round((result.macros.fats_g * 9 * 100) / result.macros.calories)}% kcal
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* DETAILED DAILY MEAL PLAN WITH EXACT FOOD QUANTITIES & NUTRITION */}
              {result.meals && result.meals.length > 0 && (
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-emerald" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Daily Meal Protocol & Portions
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    {result.meals.map((meal, mIdx) => (
                      <GlassCard key={mIdx} className="p-3 sm:p-4 flex flex-col justify-between border-white/[0.1]">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2 pb-1.5 border-b border-white/[0.06]">
                            <h4 className="font-bold text-xs text-white leading-snug">{meal.meal_name}</h4>
                            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-brand-amber px-1.5 py-0.5 rounded bg-brand-amber/10 border border-brand-amber/20 shrink-0">
                              {meal.meal_calories} kcal
                            </span>
                          </div>

                          <div className="space-y-1.5 my-2">
                            {meal.foods.map((food, fIdx) => (
                              <div key={fIdx} className="p-1.5 sm:p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-semibold text-slate-200">{food.name}</span>
                                  <span className="font-mono text-brand-cyan text-[10px] sm:text-[11px] font-bold">
                                    {food.quantity}
                                  </span>
                                </div>
                                <div className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 font-mono">
                                  {food.nutrition}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-slate-400">
                          <span>Macros:</span>
                          <span className="text-slate-200 font-semibold">
                            P: {meal.protein_g}g | C: {meal.carbs_g}g | F: {meal.fats_g}g
                          </span>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategy & Grocery Checklist */}
              <GlassCard className="p-3.5 sm:p-5 border-white/[0.12]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">
                      Targeted Grocery List
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block">{result.food_focus}</span>
                  </div>
                  <button
                    onClick={copyGroceryList}
                    className="flex items-center gap-1 text-xs text-brand-emerald hover:text-emerald-300 transition shrink-0 ml-2"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                  {result.grocery.map((item, idx) => {
                    const isChecked = !!checkedItems[item];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleCheck(item)}
                        className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-xl border transition cursor-pointer select-none ${
                          isChecked
                            ? "bg-brand-emerald/10 border-brand-emerald/30 text-slate-400 line-through"
                            : "bg-white/[0.02] border-white/[0.06] text-slate-200 hover:bg-white/[0.05]"
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <span className="text-xs font-medium">{item}</span>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
