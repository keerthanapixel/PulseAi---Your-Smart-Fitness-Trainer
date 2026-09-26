"use client";

import React, { useState } from "react";
import { Navigation, ModuleType } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { PoseCoach } from "@/components/modules/PoseCoach";
import { VirtualBuddy } from "@/components/modules/VirtualBuddy";
import { Dietician } from "@/components/modules/Dietician";
import { GymRecommender } from "@/components/modules/GymRecommender";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [activeModule, setActiveModule] = useState<ModuleType>("pose");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const getModuleMeta = (mod: ModuleType) => {
    switch (mod) {
      case "pose":
        return {
          title: "AI Squat Coach",
          subtitle: "Zero-latency MediaPipe Pose tracking with biomechanics HUD & speech synthesis",
        };
      case "chat":
        return {
          title: "Virtual Gym Buddy",
          subtitle: "Sports-science conversational intelligence powered by FastAPI",
        };
      case "diet":
        return {
          title: "AI Clinical Dietician",
          subtitle: "Mifflin-St Jeor engine, vegan/vegetarian options & portion nutrition",
        };
      case "gym":
        return {
          title: "Gym Locator & Hub",
          subtitle: "Verified gym locator, daily hypertrophy routine, and community challenges",
        };
    }
  };

  const meta = getModuleMeta(activeModule);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-obsidian-950 text-slate-100">
      {/* Navigation (Sidebar on Desktop, Fixed Bottom Bar on Mobile) */}
      <Navigation activeModule={activeModule} setActiveModule={setActiveModule} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-ambient-radial">
        <Header
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          title={meta.title}
          subtitle={meta.subtitle}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-20 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="h-full"
            >
              {activeModule === "pose" && <PoseCoach soundEnabled={soundEnabled} />}
              {activeModule === "chat" && <VirtualBuddy />}
              {activeModule === "diet" && <Dietician />}
              {activeModule === "gym" && <GymRecommender />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
