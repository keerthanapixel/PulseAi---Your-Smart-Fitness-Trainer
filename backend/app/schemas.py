from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# ==========================================
# HEALTH SCHEMAS
# ==========================================
class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str

# ==========================================
# CHATBOT SCHEMAS
# ==========================================
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User's workout, mood, or fitness query")

class ChatResponse(BaseModel):
    emotion: str
    emotion_label: str
    reply: str
    suggested_actions: List[str]
    timestamp: str

# ==========================================
# DIET SCHEMAS
# ==========================================
class DietRequest(BaseModel):
    weight_kg: float = Field(..., gt=20, lt=350, description="Weight in kilograms")
    height_cm: float = Field(..., gt=80, lt=280, description="Height in centimeters")
    goal: str = Field(..., description="Fitness goal: 'lose', 'gain', or 'maintain'")
    preference: str = Field(..., description="Dietary preference: 'veg', 'vegan', or 'non-veg'")
    target_calories: Optional[int] = Field(2000, gt=800, lt=6000, description="Target daily calorie intake")

class MacrosModel(BaseModel):
    calories: int
    protein_g: int
    carbs_g: int
    fats_g: int

class FoodItem(BaseModel):
    name: str
    quantity: str
    nutrition: str

class MealPlanItem(BaseModel):
    meal_name: str
    meal_calories: int
    protein_g: int
    carbs_g: int
    fats_g: int
    foods: List[FoodItem]

class DietResponse(BaseModel):
    bmi: float
    bmi_category: str
    bmi_message: str
    bmr_kcal: int
    tdee_kcal: int
    water_liters: float
    fiber_g: int
    strategy: str
    food_focus: str
    grocery: List[str]
    macros: MacrosModel
    meals: List[MealPlanItem]

# ==========================================
# GYM RECOMMENDER SCHEMAS
# ==========================================
class GymRequest(BaseModel):
    location: str = Field(..., min_length=1, description="Target city or neighborhood")

class GymItem(BaseModel):
    name: str
    area: str
    type: str
    rating: float
    open_hours: str
    tags: List[str]

class ExerciseItem(BaseModel):
    name: str
    sets: str

class DailyRoutine(BaseModel):
    title: str
    duration_min: int
    level: str
    exercises: List[ExerciseItem]

class PerformanceChallenge(BaseModel):
    title: str
    description: str
    reward_xp: int

class GymResponse(BaseModel):
    city: str
    gyms: List[GymItem]
    daily_routine: DailyRoutine
    daily_challenge: PerformanceChallenge
