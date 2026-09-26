import re
import os
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

# =========================================================================
# COMPREHENSIVE FITNESS & BIOMECHANICS DOMAIN KNOWLEDGE BASE
# =========================================================================

FITNESS_KNOWLEDGE_TOPICS = [
    {
        "intent": "squat_form",
        "keywords": [
            "squat", "squats", "squat form", "how to squat", "proper squat", "squat depth", 
            "parallel", "knee cave", "valgus", "stance", "low bar", "high bar"
        ],
        "label": "Biomechanical Form Coach",
        "emotion": "focused",
        "reply": (
            "Here is the golden standard for proper squat biomechanics:\n\n"
            "1. **Stance & Setup:** Feet shoulder-width apart, toes flared slightly out (15–30°). Grip the floor with your 'tripod foot' (big toe, pinky toe, heel).\n"
            "2. **The Descent:** Initiate the movement by breaking at the hips and knees simultaneously. Keep your chest tall and push your knees out in line with your second toe.\n"
            "3. **Optimal Depth:** Lower until the crease of your hip descends below the top of your knee joint (parallel or below 90°), as verified by our AI Pose Coach.\n"
            "4. **The Ascent:** Drive through your mid-foot, exhaling past the sticking point while keeping your core braced (Valsalva maneuver).\n\n"
            "💡 *Tip:* Test your depth right now in the **AI Pose Coach** tab for live 60 FPS angle verification!"
        ),
        "actions": ["Launch AI Pose Coach", "Fix Knee Valgus", "Warm-up Routine"]
    },
    {
        "intent": "knee_pain",
        "keywords": [
            "knee pain", "knees hurt", "knee ache", "pain in knee", "joint pain", "sore knees",
            "patellar", "squat hurts"
        ],
        "label": "Injury Prevention & Rehab",
        "emotion": "sad",
        "reply": (
            "Knee discomfort during squats usually stems from mechanical imbalances rather than joint damage:\n\n"
            "• **Weight Shifting to Toes:** If your heels lift, excess shear stress concentrates on the patellar tendon. Keep your weight centered over the mid-foot.\n"
            "• **Knee Valgus (Inward Caving):** When adductors overpower gluteus medius, knees collapse inward. Actively 'spread the floor' with your feet.\n"
            "• **Limited Ankle Dorsiflexion:** Tight calves force knees forward awkwardly. Elevate your heels on 5lb plates or perform wall ankle stretches.\n"
            "• **Immediate Action:** Switch to Box Squats or Reverse Lunges at a controlled tempo (3-sec eccentric) while symptoms subside."
        ),
        "actions": ["Glute Bridge Activation", "Ankle Mobility Drill", "Box Squat Protocol"]
    },
    {
        "intent": "pre_workout_meal",
        "keywords": [
            "pre workout", "pre-workout", "eat before", "before workout", "fuel before", "preworkout meal",
            "what to eat before"
        ],
        "label": "Sports Nutritionist",
        "emotion": "focused",
        "reply": (
            "Optimal pre-workout fueling maximizes muscle glycogen and prevents mid-session fatigue:\n\n"
            "• **2–3 Hours Prior (Full Meal):** Balanced complex carbs + lean protein (e.g., Brown rice with chicken breast/tofu, sweet potato with eggs). Keep dietary fat moderate to prevent sluggish digestion.\n"
            "• **30–45 Minutes Prior (Quick Fuel):** High-glycemic, low-fat fast carbs (e.g., 1 ripe banana, 2 medjool dates, or rice cakes with a smear of honey) + 500ml water.\n"
            "• **Hydration Checklist:** Drink 400–600ml of water 1 hour before training, supplemented with a pinch of pink salt for muscular hydration."
        ),
        "actions": ["Generate Diet Plan", "Hydration Protocol", "Check Macro Split"]
    },
    {
        "intent": "post_workout_meal",
        "keywords": [
            "post workout", "post-workout", "after workout", "eat after", "after gym", "postworkout meal",
            "anabolic window"
        ],
        "label": "Recovery & Hypertrophy",
        "emotion": "happy",
        "reply": (
            "Post-workout nutrition kickstarts muscle protein synthesis (MPS) and replenishes depleted glycogen stores:\n\n"
            "• **Protein Target:** Consume 25–40g of high-leucine, high-bioavailability protein within 90 minutes of training (Whey protein shake, egg whites, Greek yogurt, or paneer/tofu).\n"
            "• **Carbohydrate Re-feed:** Pair with 0.5–0.8g of carbs per kg of bodyweight (e.g., oats, white rice, or fruits) to spike insulin and shuttle amino acids into recovering muscle fibers.\n"
            "• **Rehydration:** Drink 500ml of electrolyte-rich fluids for every 0.5 kg of bodyweight lost through sweat."
        ),
        "actions": ["Macro Calculator", "High-Protein Recipes", "Log Session Burn"]
    },
    {
        "intent": "protein_intake",
        "keywords": [
            "protein", "how much protein", "protein intake", "daily protein", "protein per day", "grams of protein",
            "protein requirement"
        ],
        "label": "Macronutrient Specialist",
        "emotion": "focused",
        "reply": (
            "Here is the scientifically backed protein guideline based on activity level:\n\n"
            "• **For Muscle Growth / Strength:** **1.6 to 2.2 grams per kg** of bodyweight (0.73 to 1.0 g per lb). For a 75 kg lifter, that is roughly 120–165g daily.\n"
            "• **For Fat Loss / Caloric Deficit:** **2.0 to 2.4 grams per kg** to prevent catabolism (muscle breakdown) while burning fat.\n"
            "• **Best Vegetarian Sources:** Paneer (18g/100g), Soya chunks (52g/100g), Greek Yogurt (10g/100g), Lentils/Dal (9g/100g cooked), Quinoa.\n"
            "• **Best Non-Veg Sources:** Chicken breast (31g/100g), Whole eggs (6g/egg), Tuna/Salmon (25g/100g), Lean beef."
        ),
        "actions": ["Calculate My Macros", "Vegetarian Grocery List", "High-Protein Options"]
    },
    {
        "intent": "fat_loss",
        "keywords": [
            "lose weight", "fat loss", "lose fat", "belly fat", "cut", "cutting", "calorie deficit",
            "burn fat", "shed weight", "weight loss"
        ],
        "label": "Metabolic Conditioning",
        "emotion": "focused",
        "reply": (
            "Sustainable fat loss is governed by thermodynamics and muscle preservation:\n\n"
            "1. **Caloric Deficit:** Target a 300–500 kcal deficit below your Total Daily Energy Expenditure (TDEE). This yields 0.5–1.0 kg of steady fat loss per week without metabolic adaptation.\n"
            "2. **Keep Protein High:** At least 2.0g/kg bodyweight ensures your body burns adipose tissue instead of lean muscle tissue.\n"
            "3. **Prioritize Heavy Lifting:** Strength training signals your central nervous system to retain muscle density.\n"
            "4. **Boost NEAT (Non-Exercise Activity):** Target 8,000–10,000 daily steps. Walking is cortisol-friendly and maximizes fat oxidation."
        ),
        "actions": ["Generate Deficit Diet", "Track Daily Steps", "Metabolic Squat Routine"]
    },
    {
        "intent": "muscle_gain",
        "keywords": [
            "build muscle", "muscle gain", "bulk", "bulking", "hypertrophy", "get bigger", "gain size",
            "mass gain", "lean bulk"
        ],
        "label": "Hypertrophy Science",
        "emotion": "happy",
        "reply": (
            "The 4 non-negotiable pillars of maximum muscular hypertrophy:\n\n"
            "1. **Progressive Overload:** Increase resistance, repetitions, or improve movement execution over time. Log your numbers consistently.\n"
            "2. **Caloric Surplus:** Consume 250–400 kcal above maintenance. A lean surplus fuels protein synthesis while keeping excess fat accumulation minimal.\n"
            "3. **Working Close to Failure:** Execute your sets with 1–3 Reps in Reserve (RIR) in the 6–12 rep range for mechanical tension.\n"
            "4. **Recovery & Sleep:** Muscles grow during deep slow-wave sleep (7–9 hours nightly) when human growth hormone (HGH) peaks."
        ),
        "actions": ["Hypertrophy Diet Plan", "Century Squat Challenge", "Explore Best Gyms"]
    },
    {
        "intent": "workout_split",
        "keywords": [
            "split", "workout split", "routine", "workout plan", "ppl", "push pull legs", "upper lower",
            "full body", "best split", "how often to train"
        ],
        "label": "Program Design Specialist",
        "emotion": "focused",
        "reply": (
            "The best workout split is the one you can adhere to with 100% consistency:\n\n"
            "• **3 Days / Week (Full Body):** Mon / Wed / Fri. Perfect for beginners and busy schedules. Stimulates every muscle group 3x weekly with high systemic recovery.\n"
            "• **4 Days / Week (Upper / Lower):** Upper A, Lower A, Rest, Upper B, Lower B. Outstanding balance between strength, volume, and joint recovery.\n"
            "• **5–6 Days / Week (Push - Pull - Legs):** Push (Chest/Shoulders/Triceps), Pull (Back/Biceps/Rear Delts), Legs (Quads/Hamstrings/Calves). Ideal for intermediate/advanced lifters seeking maximal targeted volume."
        ),
        "actions": ["View Daily Routine", "Leg Day Squat Tracker", "Find Local Gyms"]
    },
    {
        "intent": "chest_workout",
        "keywords": ["chest", "bench press", "pecs", "chest workout", "build chest", "push day"],
        "label": "Strength & Conditioning",
        "emotion": "happy",
        "reply": (
            "A complete chest routine requires targeting the clavicular (upper), sternal (mid), and abdominal (lower) heads:\n\n"
            "1. **Incline Dumbbell Press (30° Angle):** 3–4 sets × 8–10 reps (Targets clavicular head for that full upper shelf).\n"
            "2. **Flat Barbell Bench Press or Weighted Dips:** 3 sets × 6–8 reps (Maximum mechanical load and sternal development).\n"
            "3. **Low-to-High Cable Flyes:** 3 sets × 12–15 reps (Peak contraction with constant tension across the adduction plane).\n"
            "4. **Pushup Burnout Finisher:** 2 sets to technical failure."
        ),
        "actions": ["Log Workout", "Upper Body Routine", "Ask Form Advice"]
    },
    {
        "intent": "back_workout",
        "keywords": ["back", "pullups", "lats", "back workout", "deadlift", "rows", "pull day"],
        "label": "Posterior Chain Specialist",
        "emotion": "focused",
        "reply": (
            "Building a dense, wide V-taper back requires vertical and horizontal pulling vectors:\n\n"
            "1. **Weighted Pull-ups or Lat Pulldowns:** 4 sets × 8–10 reps (Full lat stretch and vertical width).\n"
            "2. **Barbell or Chest-Supported Rows:** 3 sets × 8–12 reps (Rhomboid and mid-trap thickness with lower back support).\n"
            "3. **Romanian Deadlifts (RDLs):** 3 sets × 10 reps (Erectors, hamstrings, and posterior chain power).\n"
            "4. **Face Pulls with External Rotation:** 3 sets × 15 reps (Rear delts, rotator cuff, and posture health)."
        ),
        "actions": ["Routine of the Day", "Post-Workout Recovery", "Explore Gym Facilities"]
    },
    {
        "intent": "creatine",
        "keywords": ["creatine", "creatine monohydrate", "supplement", "supplements", "how to take creatine", "loading phase"],
        "label": "Sports Ergogenics",
        "emotion": "focused",
        "reply": (
            "Creatine Monohydrate is the most researched, safe, and effective natural ergogenic aid in sports science:\n\n"
            "• **Dosage:** 3 to 5 grams daily, taken consistently at any time of day (post-workout with carbs is marginally optimal).\n"
            "• **Loading Phase:** Optional. Taking 20g/day for 5 days saturates stores faster, but a flat 5g/day achieves identical saturation in 3–4 weeks without stomach upset.\n"
            "• **Mechanism:** Replenishes phosphocreatine (PCr) to rapidly regenerate adenosine triphosphate (ATP) for explosive lifts and increases intracellular hydration for muscle fullness."
        ),
        "actions": ["Calculate Macros", "Nutrition Protocol", "Hydration Tips"]
    },
    {
        "intent": "plateau",
        "keywords": ["plateau", "stuck", "not making progress", "stalled", "no gains", "lift stuck"],
        "label": "Overload & Periodization",
        "emotion": "unmotivated",
        "reply": (
            "Strength and physique plateaus happen to every athlete. Here is how to break through:\n\n"
            "1. **Execute a Deload Week:** Drop working weights by 40% and volume by 50% for 7 days. This dissipates central nervous system fatigue while preserving adaptations.\n"
            "2. **Audit Sleep & Stress:** High cortisol blunts protein synthesis. Ensure 7.5+ hours of uninterrupted sleep.\n"
            "3. **Micro-Loading:** Invest in 0.5kg / 1.25lb fractional plates. Adding 1kg per week compounds into 52kg in a year!\n"
            "4. **Caloric Check:** If you are trying to gain strength but not gaining weight, bump daily calories by 200 kcal."
        ),
        "actions": ["Deload Protocol", "Calorie Surplus Plan", "Test Form Precision"]
    },
    {
        "intent": "warmup",
        "keywords": ["warmup", "warm up", "stretch", "stretching", "mobility", "cooldown", "cool down"],
        "label": "Mobility & Warmup Coach",
        "emotion": "focused",
        "reply": (
            "Never do prolonged static stretching before lifting—it temporarily decreases peak muscular force output! Follow this dynamic protocol:\n\n"
            "1. **Systemic Temperature (3–5 Mins):** Light treadmill incline walk, rowing, or jump rope to elevate core body temperature.\n"
            "2. **Joint Articulation (3 Mins):** Leg swings, arm circles, hip 90/90 openers, and deep bodyweight squat holds.\n"
            "3. **Pyramid Warmup Sets:** When squatting or benching, do: Empty bar × 10 reps, 50% working weight × 5, 75% × 3, 90% × 1. Then start working sets."
        ),
        "actions": ["AI Squat Form Check", "Mobility Routine", "View Today's Routine"]
    },
    {
        "intent": "greeting",
        "keywords": ["hi", "hello", "hey", "sup", "yo", "morning", "who are you", "what can you do", "help"],
        "label": "PULSE AI Assistant",
        "emotion": "happy",
        "reply": (
            "Hey there, champion! I'm your **PULSE AI Gym Buddy & Fitness Coach**.\n\n"
            "Here is what I can help you conquer today:\n"
            "• **Biomechanical Form:** Ask me about squat mechanics, knee angles, and lifting cues.\n"
            "• **Nutrition & Macros:** Calculate your optimal protein targets, pre/post-workout meals, or fat loss deficit.\n"
            "• **Programming:** Recommend splits (PPL, Upper/Lower), chest/back routines, and plateau fixes.\n"
            "• **Motivation:** Turn around sluggish days with rapid 5-minute kickstarts!\n\n"
            "What are we crushing today?"
        ),
        "actions": ["Check Squat Form", "Calculate Diet & Macros", "Find Nearby Gyms"]
    }
]

# Baseline emotional mood fallback responses
EMOTION_CONFIG = {
    "sad": {
        "label": "Fatigued & Drained",
        "keywords": ["tired", "sad", "low", "exhausted", "drained", "burnt out", "sleepy", "sore", "achy", "overworked", "stressed"],
        "reply": (
            "I hear you. Pushing through severe fatigue increases injury risk. Here is what we do instead:\n\n"
            "1. Treat today as an **Active Recovery Session**: 15 minutes of foam rolling, hip openers, and light walking.\n"
            "2. Prioritize hydration and 8 hours of sleep tonight.\n"
            "3. Consistency means knowing when to recharge so you can attack tomorrow's session at 100%!"
        ),
        "actions": ["15-Min Mobility Routine", "Hydration Checklist", "Active Recovery Plan"]
    },
    "happy": {
        "label": "Pumped & High Energy",
        "keywords": ["happy", "good", "great", "excited", "pumped", "energetic", "crushing it", "strong", "ready", "beast", "hyped"],
        "reply": (
            "That's the winning mindset! Channel that adrenaline into peak training density:\n\n"
            "• Attempt a clean rep PR on your primary compound lift today.\n"
            "• Lock in your form on the **AI Pose Coach** to verify perfect depth.\n"
            "• Make sure you hit your post-workout protein window afterwards!"
        ),
        "actions": ["Launch AI Pose Coach", "Century Squat Challenge", "Log New PR Lift"]
    },
    "unmotivated": {
        "label": "Sluggish & Hesitant",
        "keywords": ["lazy", "skip", "bored", "sluggish", "procrastinating", "can't bother", "give up", "unmotivated", "couch", "not feeling it"],
        "reply": (
            "Discipline always beats motivation. Here is the **5-Minute Rule**:\n\n"
            "Just put on your workout shoes, start the timer, and do 1 set of 15 bodyweight squats. "
            "Once blood starts circulating and dopamine hits, resistance evaporates 90% of the time. "
            "Start small, win the day!"
        ),
        "actions": ["5-Minute Kickstart", "15 Bodyweight Squats", "Turn On Hype Mode"]
    },
    "neutral": {
        "label": "Focused & Ready",
        "keywords": [],
        "reply": (
            "Great to connect! Ask me anything about your workout programming, squat form verification, "
            "macronutrient targets, or recovery protocols. What's on your mind today?"
        ),
        "actions": ["Check Squat Form", "Generate Diet & Macros", "View Daily Challenge"]
    }
}


def analyze_and_respond(user_input: str) -> Dict[str, Any]:
    text_clean = user_input.lower().strip()
    words = set(re.findall(r'\b\w+\b', text_clean))
    
    # Check comprehensive fitness knowledge base first
    best_topic = None
    max_matches = 0
    
    for topic in FITNESS_KNOWLEDGE_TOPICS:
        matches = 0
        for kw in topic["keywords"]:
            if " " in kw:
                if kw in text_clean:
                    matches += 3  # Multi-word phrase matches carry higher weight
            else:
                if kw in words or kw in text_clean:
                    matches += 1
                    
        if matches > max_matches:
            max_matches = matches
            best_topic = topic
            
    # If a clear topic was matched (score >= 2 or strong multi-word match)
    if best_topic and max_matches >= 1:
        return {
            "emotion": best_topic["emotion"],
            "emotion_label": best_topic["label"],
            "reply": best_topic["reply"],
            "suggested_actions": best_topic["actions"],
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    # Check emotion mood fallbacks
    detected_emotion = "neutral"
    for emotion, cfg in EMOTION_CONFIG.items():
        if emotion == "neutral":
            continue
        if any(kw in text_clean or kw in words for kw in cfg["keywords"]):
            detected_emotion = emotion
            break
            
    cfg = EMOTION_CONFIG[detected_emotion]
    return {
        "emotion": detected_emotion,
        "emotion_label": cfg["label"],
        "reply": cfg["reply"],
        "suggested_actions": cfg["actions"],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
