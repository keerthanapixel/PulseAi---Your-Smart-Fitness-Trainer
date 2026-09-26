# PULSE AI — Unified Fitness Intelligence Platform

A production-grade, full-stack AI Fitness platform built for hackathons and high-performance demos. It combines a clean **FastAPI** backend with an **Apple Fitness / Vercel-inspired dark mode Next.js 14 frontend**, featuring **100% client-side zero-latency MediaPipe Pose computer vision**.

---

## 🏗️ Architecture Overview

```
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application with CORS & router mounts
│   │   ├── schemas.py                  # Pydantic models for chat, diet, gym, and health
│   │   ├── routers/
│   │   │   ├── chat.py                 # POST /api/chat (Virtual Gym Buddy)
│   │   │   ├── diet.py                 # POST /api/diet (AI Dietician)
│   │   │   └── gym.py                  # POST /api/gym (Gym Recommender)
│   │   └── services/
│   │       ├── chatbot_service.py      # Sentiment & emotion-based motivation engine
│   │       ├── diet_service.py         # BMI, caloric goals & macronutrient logic
│   │       └── gym_service.py          # City gym database, routines of the day, challenges
│   ├── requirements.txt
│   └── run.py                          # Single-command backend runner
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx              # Dark-mode root layout & SEO metadata
│   │   │   ├── page.tsx                # Dynamic module switchboard with Framer Motion
│   │   │   └── globals.css             # Glassmorphic panels, obsidian theme & glow
│   │   ├── components/
│   │   │   ├── Navigation.tsx          # Sleek sidebar & responsive tabs
│   │   │   ├── Header.tsx              # Real-time FastAPI connectivity & audio master
│   │   │   ├── ui/
│   │   │   │   └── GlassCard.tsx       # Reusable frosted glass component
│   │   │   └── modules/
│   │   │       ├── PoseCoach.tsx       # Client-side MediaPipe Squat tracker + Canvas HUD + Speech
│   │   │       ├── VirtualBuddy.tsx    # ChatGPT-style chat with emotional tone badges
│   │   │       ├── Dietician.tsx       # Interactive inputs + glassmorphic BMI/Macro cards
│   │   │       └── GymRecommender.tsx  # Gym locator cards + Daily workout & challenge
│   │   └── lib/
│   │       └── api.ts                  # Typed client for the FastAPI backend
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── start_backend.bat                   # 1-click backend launcher
└── start_frontend.bat                  # 1-click frontend launcher
```

---

## ⚡ Key Highlights & Innovations

1. **Zero-Latency Client-Side MediaPipe Vision (`PoseCoach.tsx`)**:
   - Instead of streaming webcam frames over HTTP/WebSocket to Python (which introduces 200–500ms lag and server overhead), the computer vision runs **100% in the user's browser at 60 FPS**.
   - Tracks **Left Hip**, **Left Knee**, and **Left Ankle** landmarks.
   - Computes dynamic knee joint angle with trigonometric accuracy:
     - `angle < 95°`: registers squat depth (`down` stage)
     - `angle > 160°`: registers rep completion (`up` stage, `+1 Rep`)
     - `95° <= angle <= 135°`: prompts real-time cue `"Go Lower"`
   - Overlays a neon glowing skeleton HUD and knee angle gauge on an HTML5 `<canvas>`.
   - Native audio coaching feedback using the browser's `SpeechSynthesis` API with mute/unmute control.

2. **Virtual Gym Buddy (`VirtualBuddy.tsx`)**:
   - ChatGPT-style conversation interface connecting to `/api/chat`.
   - Classifies emotional state (`PUMPED`, `FATIGUED`, `UNMOTIVATED`, `FOCUSED`) and adapts responses accordingly.
   - Suggested action pills and quick-prompt starters.

3. **AI Dietician (`Dietician.tsx`)**:
   - Dual-column interactive input panel for weight, height, goal, preference, and daily target calories.
   - Glassmorphic result cards:
     - BMI metric gauge with clinical category & guidance.
     - Macronutrient breakdown (Protein, Carbs, Fats) with exact grams and percentage calories.
     - Interactive checklist for groceries with 1-click copy to clipboard.

4. **Gym Recommender & Daily Challenge (`GymRecommender.tsx`)**:
   - City search (Bangalore, Chennai, Mumbai, Delhi) with star ratings, badges, and open hours.
   - Daily Hypertrophy Workout Routine breakdown.
   - Interactive Community Performance Challenge card.

---

## 🚀 How to Run the Project

### 1. Start the FastAPI Backend
Open a terminal in the project root:
```powershell
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
- **Backend API**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

### 2. Start the Next.js Frontend
Open a second terminal in the project root:
```powershell
cd frontend
npm run dev
```
- **Frontend Web App**: `http://localhost:3000`

Or simply double-click `start_backend.bat` and `start_frontend.bat`!
