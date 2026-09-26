const API_BASE_URL =
  typeof window !== "undefined"
    ? "/api/py"
    : process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export interface ChatResponse {
  emotion: string;
  emotion_label: string;
  reply: string;
  suggested_actions: string[];
  timestamp: string;
}

export interface DietRequest {
  weight_kg: number;
  height_cm: number;
  goal: string;
  preference: string;
  target_calories: number;
}

export interface Macros {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
}

export interface FoodItem {
  name: string;
  quantity: string;
  nutrition: string;
}

export interface MealPlanItem {
  meal_name: string;
  meal_calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  foods: FoodItem[];
}

export interface DietResponse {
  bmi: number;
  bmi_category: string;
  bmi_message: string;
  bmr_kcal: number;
  tdee_kcal: number;
  water_liters: number;
  fiber_g: number;
  strategy: string;
  food_focus: string;
  grocery: string[];
  macros: Macros;
  meals: MealPlanItem[];
}

export interface GymItem {
  name: string;
  area: string;
  type: string;
  rating: number;
  open_hours: string;
  tags: string[];
}

export interface DailyRoutine {
  title: string;
  duration_min: number;
  level: string;
  exercises: { name: string; sets: string }[];
}

export interface PerformanceChallenge {
  title: string;
  description: string;
  reward_xp: number;
}

export interface GymResponse {
  city: string;
  gyms: GymItem[];
  daily_routine: DailyRoutine;
  daily_challenge: PerformanceChallenge;
}

export const api = {
  async sendChatMessage(message: string): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) {
      throw new Error(`Chat API error: ${res.statusText}`);
    }
    return res.json();
  },

  async calculateDiet(payload: DietRequest): Promise<DietResponse> {
    const res = await fetch(`${API_BASE_URL}/diet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Diet API error: ${res.statusText}`);
    }
    return res.json();
  },

  async getGyms(location: string): Promise<GymResponse> {
    const res = await fetch(`${API_BASE_URL}/gym`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location }),
    });
    if (!res.ok) {
      throw new Error(`Gym API error: ${res.statusText}`);
    }
    return res.json();
  },

  async checkHealth(): Promise<{ status: string; version: string; timestamp: string }> {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
  },
};
