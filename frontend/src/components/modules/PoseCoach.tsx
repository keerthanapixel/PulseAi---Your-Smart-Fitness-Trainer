"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Play,
  Square,
  RotateCcw,
  Sparkles,
  Activity,
  ShieldCheck,
  Flame,
  Volume2,
  Info,
  Maximize2,
  Minimize2,
  Camera as CameraIcon,
  Crosshair,
  UserCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

interface PoseCoachProps {
  soundEnabled: boolean;
}

// MediaPipe global declarations
declare global {
  interface Window {
    Pose: any;
    Camera: any;
  }
}

interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  centerX: number;
  centerY: number;
}

export const PoseCoach: React.FC<PoseCoachProps> = ({ soundEnabled }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<any>(null);
  const poseRef = useRef<any>(null);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [reps, setReps] = useState<number>(0);
  const [currentAngle, setCurrentAngle] = useState<number>(180);
  const [stage, setStage] = useState<"up" | "down">("up");
  const [feedback, setFeedback] = useState<string>("Stand in frame to begin");
  const [caloriesBurned, setCaloriesBurned] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPersonLocked, setIsPersonLocked] = useState<boolean>(false);
  const [trackingLeg, setTrackingLeg] = useState<"Left" | "Right" | "Dual">("Left");
  const [showRules, setShowRules] = useState<boolean>(false);

  // References to keep state accessible inside animation loop without stale closures
  const repsRef = useRef<number>(0);
  const stageRef = useRef<"up" | "down">("up");
  const prevFeedbackRef = useRef<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const smoothedAngleRef = useRef<number>(180);
  const smoothedBoxRef = useRef<BoundingBox | null>(null);
  const lastRepTimeRef = useRef<number>(0);

  // Audio Speech Synthesis Trigger
  const speakCue = useCallback(
    (text: string) => {
      if (!soundEnabled || !("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel(); // Cancel ongoing utterance to eliminate lag
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.15;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("TTS Error:", e);
      }
    },
    [soundEnabled]
  );

  // Trigonometric angle calculation between 3 points
  const calculateAngle = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    c: { x: number; y: number }
  ): number => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
      angle = 360.0 - angle;
    }
    return Math.round(angle);
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request error:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Process MediaPipe Pose results with Bilateral Leg Tracking & Person Lock
  const onResults = useCallback(
    (results: any) => {
      if (!canvasRef.current || !videoRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Draw mirrored feed if front camera
      if (facingMode === "user") {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(results.image, 0, 0, width, height);
        ctx.restore();
      } else {
        ctx.drawImage(results.image, 0, 0, width, height);
        ctx.restore();
      }

      if (results.poseLandmarks && results.poseLandmarks.length > 0) {
        const landmarks = results.poseLandmarks;

        // Transform landmark coordinate depending on mirror state
        const getPoint = (idx: number) => {
          const lm = landmarks[idx];
          const x = facingMode === "user" ? (1 - lm.x) * width : lm.x * width;
          const y = lm.y * height;
          return { x, y, v: lm.visibility || 0 };
        };

        // Key landmarks for Squats & Body Lock:
        // Left Side: 11 (Shoulder), 23 (Hip), 25 (Knee), 27 (Ankle)
        // Right Side: 12 (Shoulder), 24 (Hip), 26 (Knee), 28 (Ankle)
        const lShoulder = getPoint(11);
        const rShoulder = getPoint(12);
        const lHip = getPoint(23);
        const rHip = getPoint(24);
        const lKnee = getPoint(25);
        const rKnee = getPoint(26);
        const lAnkle = getPoint(27);
        const rAnkle = getPoint(28);

        // Compute Bounding Box covering the person to LOCK ON
        const relevantIndices = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
        let minX = width;
        let maxX = 0;
        let minY = height;
        let maxY = 0;
        let validPts = 0;

        for (const idx of relevantIndices) {
          const pt = getPoint(idx);
          if (pt.v > 0.3) {
            minX = Math.min(minX, pt.x);
            maxX = Math.max(maxX, pt.x);
            minY = Math.min(minY, pt.y);
            maxY = Math.max(maxY, pt.y);
            validPts++;
          }
        }

        const isLocked = validPts >= 5 && lHip.v > 0.4 && rHip.v > 0.4;
        setIsPersonLocked(isLocked);

        if (isLocked) {
          // Add margin padding to bounding box
          const padX = (maxX - minX) * 0.15;
          const padY = (maxY - minY) * 0.1;
          const targetBox: BoundingBox = {
            minX: Math.max(10, minX - padX),
            minY: Math.max(10, minY - padY),
            maxX: Math.min(width - 10, maxX + padX),
            maxY: Math.min(height - 10, maxY + padY),
            centerX: (minX + maxX) / 2,
            centerY: (minY + maxY) / 2,
          };

          // Smooth bounding box via linear interpolation (Lerp)
          if (!smoothedBoxRef.current) {
            smoothedBoxRef.current = targetBox;
          } else {
            const b = smoothedBoxRef.current;
            b.minX += (targetBox.minX - b.minX) * 0.25;
            b.minY += (targetBox.minY - b.minY) * 0.25;
            b.maxX += (targetBox.maxX - b.maxX) * 0.25;
            b.maxY += (targetBox.maxY - b.maxY) * 0.25;
            b.centerX += (targetBox.centerX - b.centerX) * 0.25;
            b.centerY += (targetBox.centerY - b.centerY) * 0.25;
          }

          const sb = smoothedBoxRef.current;
          const boxW = sb.maxX - sb.minX;
          const boxH = sb.maxY - sb.minY;
          const cornerLen = Math.min(36, boxW * 0.2, boxH * 0.2);

          // DRAW CYBERNETIC TARGET LOCK BRACKETS
          ctx.save();
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#10b981"; // Emerald Lock
          ctx.shadowColor = "rgba(16, 185, 129, 0.8)";
          ctx.shadowBlur = 12;

          // Top-Left Bracket
          ctx.beginPath();
          ctx.moveTo(sb.minX, sb.minY + cornerLen);
          ctx.lineTo(sb.minX, sb.minY);
          ctx.lineTo(sb.minX + cornerLen, sb.minY);
          ctx.stroke();

          // Top-Right Bracket
          ctx.beginPath();
          ctx.moveTo(sb.maxX - cornerLen, sb.minY);
          ctx.lineTo(sb.maxX, sb.minY);
          ctx.lineTo(sb.maxX, sb.minY + cornerLen);
          ctx.stroke();

          // Bottom-Left Bracket
          ctx.beginPath();
          ctx.moveTo(sb.minX, sb.maxY - cornerLen);
          ctx.lineTo(sb.minX, sb.maxY);
          ctx.lineTo(sb.minX + cornerLen, sb.maxY);
          ctx.stroke();

          // Bottom-Right Bracket
          ctx.beginPath();
          ctx.moveTo(sb.maxX - cornerLen, sb.maxY);
          ctx.lineTo(sb.maxX, sb.maxY);
          ctx.lineTo(sb.maxX, sb.maxY - cornerLen);
          ctx.stroke();

          // Center Torso Lock Crosshair
          const cX = sb.centerX;
          const cY = (lHip.y + rHip.y) / 2;
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "rgba(6, 182, 212, 0.7)";
          ctx.beginPath();
          ctx.arc(cX, cY, 14, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cX - 20, cY);
          ctx.lineTo(cX + 20, cY);
          ctx.moveTo(cX, cY - 20);
          ctx.lineTo(cX, cY + 20);
          ctx.stroke();

          // Target Lock Label
          ctx.shadowBlur = 0;
          ctx.font = "bold 11px monospace";
          ctx.fillStyle = "#10b981";
          ctx.fillText("TARGET LOCKED: ATHLETE 1", sb.minX + 4, sb.minY - 8);
          ctx.restore();
        }

        // ==========================================
        // BILATERAL LEG TRACKING & ACCURACY LOGIC
        // ==========================================
        const leftLegConfidence = (lHip.v + lKnee.v + lAnkle.v) / 3;
        const rightLegConfidence = (rHip.v + rKnee.v + rAnkle.v) / 3;

        let selectedAngle: number;
        let activeKneePoint = lKnee;

        const leftAngle = calculateAngle(lHip, lKnee, lAnkle);
        const rightAngle = calculateAngle(rHip, rKnee, rAnkle);

        if (leftLegConfidence > rightLegConfidence + 0.15) {
          selectedAngle = leftAngle;
          activeKneePoint = lKnee;
          setTrackingLeg("Left");
        } else if (rightLegConfidence > leftLegConfidence + 0.15) {
          selectedAngle = rightAngle;
          activeKneePoint = rKnee;
          setTrackingLeg("Right");
        } else {
          // Both legs well visible: average angles for maximum biomechanical precision
          selectedAngle = Math.round((leftAngle + rightAngle) / 2);
          activeKneePoint = leftLegConfidence >= rightLegConfidence ? lKnee : rKnee;
          setTrackingLeg("Dual");
        }

        // Exponential Moving Average (EMA) smoothing to eliminate single-frame jitter
        const smoothedAngle = Math.round(
          0.7 * selectedAngle + 0.3 * smoothedAngleRef.current
        );
        smoothedAngleRef.current = smoothedAngle;
        setCurrentAngle(smoothedAngle);

        // Rep Counting & Depth Evaluation
        const now = Date.now();
        let newFeedback = "";

        if (smoothedAngle > 160) {
          if (stageRef.current === "down" && now - lastRepTimeRef.current > 800) {
            repsRef.current += 1;
            setReps(repsRef.current);
            setCaloriesBurned(Math.round(repsRef.current * 0.32 * 10) / 10);
            newFeedback = "Good Rep!";
            stageRef.current = "up";
            setStage("up");
            lastRepTimeRef.current = now;
          }
        } else if (smoothedAngle < 95) {
          stageRef.current = "down";
          setStage("down");
          newFeedback = "Hold Depth";
        } else if (smoothedAngle >= 95 && smoothedAngle <= 135 && stageRef.current === "up") {
          newFeedback = "Go Lower";
        }

        if (newFeedback && newFeedback !== prevFeedbackRef.current) {
          setFeedback(newFeedback);
          prevFeedbackRef.current = newFeedback;
          speakCue(newFeedback);
        }

        // Draw Full Glowing Neon Skeleton Connections
        const drawBone = (pA: { x: number; y: number }, pB: { x: number; y: number }, color = "#06b6d4") => {
          ctx.save();
          ctx.lineWidth = 4;
          ctx.strokeStyle = stageRef.current === "down" ? "#10b981" : color;
          ctx.shadowColor = stageRef.current === "down" ? "rgba(16, 185, 129, 0.8)" : "rgba(6, 182, 212, 0.7)";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(pB.x, pB.y);
          ctx.stroke();
          ctx.restore();
        };

        // Torso / Spine
        drawBone(lShoulder, rShoulder, "#8b5cf6");
        drawBone(lHip, rHip, "#8b5cf6");
        drawBone(lShoulder, lHip, "#8b5cf6");
        drawBone(rShoulder, rHip, "#8b5cf6");

        // Legs (Highlight active squat tracking)
        drawBone(lHip, lKnee, "#10b981");
        drawBone(lKnee, lAnkle, "#10b981");
        drawBone(rHip, rKnee, "#06b6d4");
        drawBone(rKnee, rAnkle, "#06b6d4");

        // Highlight Joints
        [lHip, rHip, lKnee, rKnee, lAnkle, rAnkle].forEach((pt) => {
          ctx.save();
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 6, 0, 2 * Math.PI);
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = stageRef.current === "down" ? "#10b981" : "#06b6d4";
          ctx.stroke();
          ctx.restore();
        });

        // Dynamic Angle Tag adjacent to active knee
        ctx.save();
        ctx.font = "bold 18px monospace";
        ctx.fillStyle = smoothedAngle < 95 ? "#10b981" : smoothedAngle > 160 ? "#06b6d4" : "#f59e0b";
        ctx.fillText(`${smoothedAngle}°`, activeKneePoint.x + 18, activeKneePoint.y - 10);
        ctx.restore();
      } else {
        setIsPersonLocked(false);
      }
    },
    [facingMode, speakCue]
  );

  // Load MediaPipe scripts dynamically
  const loadMediaPipeScripts = async (): Promise<boolean> => {
    if (window.Pose && window.Camera) return true;

    setIsModelLoading(true);
    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.crossOrigin = "anonymous";
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    try {
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js");
      setIsModelLoading(false);
      return true;
    } catch (err) {
      console.error("Failed to load MediaPipe scripts:", err);
      setIsModelLoading(false);
      setCameraError("Failed to load computer vision model. Please check internet connection.");
      return false;
    }
  };

  // Start Camera with Maximum Area Coverage & 16:9 Wide Field of View
  const startCamera = async (overrideFacing?: "user" | "environment") => {
    setCameraError(null);
    const loaded = await loadMediaPipeScripts();
    if (!loaded) return;

    if (!videoRef.current || !canvasRef.current) return;

    const activeMode = overrideFacing || facingMode;

    try {
      if (cameraRef.current) {
        try {
          cameraRef.current.stop();
        } catch (e) {}
      }

      const pose = new window.Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults(onResults);
      poseRef.current = pose;

      // Request maximum field of view (HD 1280x720) to cover the maximum area
      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && poseRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 1280,
        height: 720,
        facingMode: activeMode,
      });

      await camera.start();
      cameraRef.current = camera;
      setIsRunning(true);
      setFeedback("Acquiring target... Step into frame");
      speakCue("Coach ready. Stand back to lock on.");

      // Timer
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setElapsedTime((prev) => prev + 1);
        }, 1000);
      }
    } catch (err: any) {
      console.error("Camera startup error:", err);
      setCameraError(err.message || "Failed to access webcam. Please allow camera permissions.");
      setIsRunning(false);
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    if (isRunning) {
      startCamera(nextMode);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (cameraRef.current) {
      try {
        cameraRef.current.stop();
      } catch (e) {}
      cameraRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setIsPersonLocked(false);
    setFeedback("Workout paused");
  };

  const resetCounter = () => {
    repsRef.current = 0;
    setReps(0);
    setCaloriesBurned(0);
    setElapsedTime(0);
    stageRef.current = "up";
    setStage("up");
    setFeedback("Counter reset. Ready for rep 1!");
    speakCue("Counter reset");
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto space-y-3 sm:space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2 tracking-tight">
            AI Squat & Pose Lock Coach
            <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30">
              HD Auto-Lock
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
            Wide-angle maximum area coverage with continuous person tracking & bilateral joint angles
          </p>
        </div>

        {/* Lock Status Pill */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-mono border transition-all ${
              isPersonLocked
                ? "bg-brand-emerald/20 text-brand-emerald border-brand-emerald/40 shadow-lg shadow-brand-emerald/10"
                : isRunning
                ? "bg-brand-amber/20 text-brand-amber border-brand-amber/40 animate-pulse"
                : "bg-white/[0.04] text-slate-400 border-white/[0.08]"
            }`}
          >
            {isPersonLocked ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>PERSON LOCKED</span>
              </>
            ) : isRunning ? (
              <>
                <Crosshair className="w-3.5 h-3.5 animate-spin" />
                <span>SEARCHING TARGET...</span>
              </>
            ) : (
              <>
                <Crosshair className="w-3.5 h-3.5" />
                <span>CAMERA IDLE</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6">
        {/* Maximum Area Video & Vision HUD Column */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div ref={containerRef} className="relative w-full">
            <GlassCard className="relative overflow-hidden p-1 aspect-video w-full bg-obsidian-950 flex items-center justify-center border-white/[0.12] shadow-2xl rounded-2xl">
              {/* Hidden HTML5 Video element */}
              <video ref={videoRef} className="hidden" playsInline muted />

              {/* Wide-angle Canvas for Maximum Area Video & Skeleton HUD */}
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="w-full h-full object-cover rounded-xl"
              />

              {/* Idle Placeholder */}
              {!isRunning && !isModelLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-obsidian-950/85 backdrop-blur-md">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center mb-3 sm:mb-4 text-brand-emerald">
                    <Crosshair className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse" />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2">AI Squat & Pose Lock Coach</h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-4 sm:mb-6 leading-relaxed line-clamp-2 sm:line-clamp-none">
                    Expanded 16:9 wide coverage locks onto your full body automatically with bilateral joint tracking.
                  </p>
                  <button
                    onClick={() => startCamera()}
                    className="px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-xl bg-brand-emerald hover:bg-brand-emerald/90 text-obsidian-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-brand-emerald/30 transition-transform active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Launch Wide-Area Camera
                  </button>
                </div>
              )}

              {/* Model Loading State */}
              {isModelLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-obsidian-950/90 backdrop-blur-md">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-brand-cyan/20 border-t-brand-cyan animate-spin mb-3 sm:mb-4" />
                  <h4 className="text-sm sm:text-base font-semibold text-white">Loading Neural Pose Engine...</h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-1">Downloading client-side MediaPipe weights</p>
                </div>
              )}

              {/* Live HUD Overlay when Running */}
              {isRunning && (
                <>
                  {/* Top-Left: Big Rep Counter & Stage */}
                  <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 p-2 sm:p-3 rounded-xl bg-obsidian-900/85 backdrop-blur-md border border-white/[0.12] flex items-center gap-2 sm:gap-3 shadow-xl">
                    <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-slate-400">Reps</span>
                      <span className="text-2xl sm:text-4xl font-black font-mono tracking-tight text-white leading-none mt-0.5">{reps}</span>
                    </div>
                    <div className="h-7 sm:h-10 w-[1px] bg-white/[0.1]" />
                    <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-slate-400">Stage</span>
                      <span
                        className={`text-[10px] sm:text-xs font-black uppercase font-mono px-1.5 sm:px-2 py-0.5 rounded-md mt-0.5 ${
                          stage === "down"
                            ? "bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/40"
                            : "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40"
                        }`}
                      >
                        {stage}
                      </span>
                    </div>
                  </div>

                  {/* Top-Right: Angle Gauge & Leg Dominance */}
                  <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 p-2 sm:p-3 rounded-xl bg-obsidian-900/85 backdrop-blur-md border border-white/[0.12] flex flex-col items-end shadow-xl">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-[8px] sm:text-[9px] font-mono uppercase px-1 sm:px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400">
                        {trackingLeg} Leg
                      </span>
                      <span className="text-lg sm:text-2xl font-bold font-mono text-brand-cyan leading-none">{currentAngle}°</span>
                    </div>
                    <div className="w-16 sm:w-24 h-1 sm:h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-75 ${
                          currentAngle < 95
                            ? "bg-brand-emerald"
                            : currentAngle > 160
                            ? "bg-brand-cyan"
                            : "bg-brand-amber"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, ((180 - currentAngle) / 90) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottom Cue Banner */}
                  <div className="absolute bottom-2.5 inset-x-2.5 sm:bottom-4 sm:inset-x-4 flex justify-center pointer-events-none">
                    <div
                      className={`px-3 py-1 sm:px-5 sm:py-2 rounded-xl backdrop-blur-xl border text-xs sm:text-sm font-bold tracking-wide shadow-2xl flex items-center gap-1.5 sm:gap-2 transition-all duration-300 ${
                        feedback === "Good Rep!"
                          ? "bg-brand-emerald/90 text-obsidian-950 border-brand-emerald"
                          : feedback === "Go Lower"
                          ? "bg-brand-amber/90 text-obsidian-950 border-brand-amber"
                          : "bg-obsidian-900/90 text-white border-white/[0.15]"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{feedback}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Camera Error Message */}
              {cameraError && (
                <div className="absolute inset-x-2.5 bottom-2.5 sm:inset-x-4 sm:bottom-4 p-3 sm:p-4 rounded-xl bg-brand-rose/20 border border-brand-rose/50 text-white text-xs">
                  <span className="font-bold">Error:</span> {cameraError}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Video Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {!isRunning ? (
                <button
                  onClick={() => startCamera()}
                  disabled={isModelLoading}
                  className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-emerald/90 text-obsidian-950 font-bold text-xs flex items-center gap-1.5 sm:gap-2 transition active:scale-95 shadow-lg shadow-brand-emerald/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Camera</span>
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-brand-rose hover:bg-brand-rose/90 text-white font-bold text-xs flex items-center gap-1.5 sm:gap-2 transition active:scale-95 shadow-lg shadow-brand-rose/20"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={resetCounter}
                className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] font-medium text-xs flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              {/* Flip Camera Button (Front vs Rear) */}
              <button
                onClick={toggleFacingMode}
                className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] font-medium text-xs flex items-center gap-1.5 transition"
                title="Switch Camera (Front / Rear)"
              >
                <CameraIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{facingMode === "user" ? "Front" : "Rear"}</span>
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] font-medium text-xs flex items-center transition"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-slate-400">
              <span>Time:</span>
              <span className="text-white font-semibold">{formatTime(elapsedTime)}</span>
            </div>
          </div>
        </div>

        {/* Stats & Form Breakdown Column */}
        <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-4">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <GlassCard className="p-3 sm:p-4" glow="emerald">
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 text-xs mb-1">
                <ShieldCheck className="w-4 h-4 text-brand-emerald" />
                <span>Valid Reps</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">{reps}</div>
              <div className="text-[10px] text-brand-emerald mt-0.5 font-mono">Parallel &lt; 95°</div>
            </GlassCard>

            <GlassCard className="p-3 sm:p-4" glow="amber">
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 text-xs mb-1">
                <Flame className="w-4 h-4 text-brand-amber" />
                <span>Est. Burn</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {caloriesBurned} <span className="text-xs font-normal text-slate-400">kcal</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">~0.32 kcal / rep</div>
            </GlassCard>
          </div>

          {/* Squat Mechanics Guide (Collapsible on Mobile, Expanded on Desktop) */}
          <GlassCard className="p-3.5 sm:p-5 flex flex-col gap-2.5 sm:gap-4">
            <button
              onClick={() => setShowRules(!showRules)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-brand-cyan" />
                <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Auto-Lock Rules
                </h4>
              </div>
              <div className="lg:hidden text-slate-400">
                {showRules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            <div className={`flex flex-col gap-2 sm:gap-3 text-xs text-slate-300 ${showRules ? "block" : "hidden lg:flex"}`}>
              <div className="flex items-start gap-2.5 p-2 sm:p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand-emerald/20 text-brand-emerald font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  <span className="font-semibold text-white block text-xs">Auto Subject Lock</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Green tracking brackets lock onto your full body, keeping tracking active as you step back.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 sm:p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand-cyan/20 text-brand-cyan font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  <span className="font-semibold text-white block text-xs">Bilateral Leg Tracking</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Automatically checks both left and right legs to track the cleanest camera angle.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 sm:p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand-amber/20 text-brand-amber font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  <span className="font-semibold text-white block text-xs">Continuous 60 FPS Feedback</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Zero-latency client vision with exponential smoothing prevents false reps.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Audio Coach Status */}
          <GlassCard className="p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className={`p-1.5 sm:p-2 rounded-lg ${soundEnabled ? "bg-brand-cyan/20 text-brand-cyan" : "bg-white/[0.04] text-slate-500"}`}>
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Speech Coach</span>
                <span className="text-[10px] text-slate-400">
                  {soundEnabled ? "Voice synthesis active" : "Muted from header"}
                </span>
              </div>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
              Web Speech
            </span>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
