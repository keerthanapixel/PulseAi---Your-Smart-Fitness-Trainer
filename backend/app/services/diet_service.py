from typing import Dict, Any, List

def calculate_diet_plan(
    weight_kg: float,
    height_cm: float,
    goal: str,
    preference: str,
    target_calories: int = 2000
) -> Dict[str, Any]:
    height_m = height_cm / 100.0
    bmi = round(weight_kg / (height_m ** 2), 2)
    
    # 1. Clinical BMI Evaluation
    if bmi < 18.5:
        bmi_cat = "Underweight"
        bmi_msg = "Hypertrophic surplus advised to support bone mineral density, metabolic health, and muscle tissue."
    elif bmi < 25.0:
        bmi_cat = "Normal weight"
        bmi_msg = "Optimal physiological baseline. Maintain clean micronutrient density and progressive training overload."
    elif bmi < 30.0:
        bmi_cat = "Overweight"
        bmi_msg = "Target a moderate 350-500 kcal deficit while keeping protein high (2.0g/kg) to preserve lean mass."
    else:
        bmi_cat = "Obese"
        bmi_msg = "Prioritize whole-food volume satiety, cardiovascular conditioning, and gradual fat loss protocol."

    # 2. BMR & TDEE Calculations (Mifflin-St Jeor Formula)
    # Assumes baseline age 25 for standardized athletic model
    bmr = int(round(10 * weight_kg + 6.25 * height_cm - 5 * 25 + 5))
    tdee = int(round(bmr * 1.45))
    water_liters = round(weight_kg * 0.038, 1)
    fiber_g = int(round((target_calories / 1000) * 14))

    # 3. Goal-based Macro Allocation
    g_clean = goal.strip().lower()
    if g_clean in ["lose", "fat loss", "cutting"]:
        strategy = "High-protein, satiety-focused deficit protocol preserving nitrogen balance during lipolysis."
        protein_ratio = 0.35
        carbs_ratio = 0.35
        fats_ratio = 0.30
    elif g_clean in ["gain", "muscle gain", "bulking"]:
        strategy = "Lean hypertrophy protocol with glycogen-replenishing carbohydrates and an anabolic protein ceiling."
        protein_ratio = 0.30
        carbs_ratio = 0.50
        fats_ratio = 0.20
    else:
        strategy = "Isocaloric metabolic maintenance matching expenditure with balanced energy substrates."
        protein_ratio = 0.30
        carbs_ratio = 0.45
        fats_ratio = 0.25

    protein_g = int(round((target_calories * protein_ratio) / 4))
    carbs_g = int(round((target_calories * carbs_ratio) / 4))
    fats_g = int(round((target_calories * fats_ratio) / 9))

    # 4. Dietary Preference Logic: Vegan vs Vegetarian vs Non-Vegetarian
    pref_clean = preference.strip().lower()
    is_vegan = "vegan" in pref_clean
    is_veg = "veg" in pref_clean and "non" not in pref_clean and not is_vegan

    if is_vegan:
        focus = (
            "100% Plant-Based Bioactive Proteins: Extra-firm tofu, organic tempeh, edamame, red/black lentils, "
            "hemp seeds, nutritional yeast, chia seeds, and fortified plant milks. Zero animal or dairy products."
        )
        grocery = [
            "Extra-firm Organic Tofu (800g)",
            "Non-GMO Tempeh (400g)",
            "Dry Red Lentils & Chickpeas (1kg)",
            "Shelled Edamame (500g)",
            "Whole Rolled Oats (1kg)",
            "Raw Chia & Hemp Seeds (300g)",
            "Nutritional Yeast Flakes (150g)",
            "Unsweetened Almond / Soy Milk (2L)",
            "Baby Spinach & Kale Medley (500g)",
            "Frozen Blueberries & Bananas (1kg)",
            "Cold-Pressed Extra Virgin Olive Oil (500ml)"
        ]

        # Detailed Meal Plan with Quantities & Nutrition for VEGAN
        meals = [
            {
                "meal_name": "Breakfast: Anabolic Plant Power Bowl",
                "meal_calories": int(round(target_calories * 0.25)),
                "protein_g": int(round(protein_g * 0.25)),
                "carbs_g": int(round(carbs_g * 0.25)),
                "fats_g": int(round(fats_g * 0.25)),
                "foods": [
                    {"name": "Whole Rolled Oats", "quantity": "80g dry", "nutrition": "300 kcal • 10g Protein • 54g Carbs"},
                    {"name": "Plant Protein Powder (Pea/Soy)", "quantity": "1 scoop (32g)", "nutrition": "120 kcal • 24g Protein • 2g Carbs"},
                    {"name": "Unsweetened Soy Milk", "quantity": "250ml", "nutrition": "80 kcal • 7g Protein • 4g Carbs"},
                    {"name": "Chia Seeds & Berries", "quantity": "15g seeds + 75g berries", "nutrition": "110 kcal • 3g Protein • 15g Carbs"}
                ]
            },
            {
                "meal_name": "Lunch: High-Protein Tofu & Quinoa Buddha Bowl",
                "meal_calories": int(round(target_calories * 0.35)),
                "protein_g": int(round(protein_g * 0.35)),
                "carbs_g": int(round(carbs_g * 0.35)),
                "fats_g": int(round(fats_g * 0.35)),
                "foods": [
                    {"name": "Pan-Seared Extra-Firm Tofu", "quantity": "200g", "nutrition": "280 kcal • 30g Protein • 6g Carbs • 16g Fats"},
                    {"name": "Cooked Tricolor Quinoa", "quantity": "180g (1 bowl)", "nutrition": "220 kcal • 8g Protein • 39g Carbs"},
                    {"name": "Steamed Edamame", "quantity": "80g", "nutrition": "95 kcal • 9g Protein • 7g Carbs"},
                    {"name": "Kale & Broccoli Medley w/ Olive Oil", "quantity": "150g greens + 10ml oil", "nutrition": "130 kcal • 4g Protein • 9g Fats"}
                ]
            },
            {
                "meal_name": "Pre/Post-Workout: Muscle Synthesis Fuel",
                "meal_calories": int(round(target_calories * 0.15)),
                "protein_g": int(round(protein_g * 0.15)),
                "carbs_g": int(round(carbs_g * 0.15)),
                "fats_g": int(round(fats_g * 0.15)),
                "foods": [
                    {"name": "Ripe Medium Banana", "quantity": "1 medium (118g)", "nutrition": "105 kcal • 1g Protein • 27g Carbs"},
                    {"name": "Raw Almonds & Walnuts", "quantity": "30g", "nutrition": "185 kcal • 6g Protein • 6g Carbs • 16g Fats"},
                    {"name": "Hemp Protein Water", "quantity": "1 serving (20g)", "nutrition": "80 kcal • 12g Protein • 2g Carbs"}
                ]
            },
            {
                "meal_name": "Dinner: Spiced Tempeh & Sweet Potato Skillet",
                "meal_calories": int(round(target_calories * 0.25)),
                "protein_g": int(round(protein_g * 0.25)),
                "carbs_g": int(round(carbs_g * 0.25)),
                "fats_g": int(round(fats_g * 0.25)),
                "foods": [
                    {"name": "Marinated Organic Tempeh", "quantity": "160g", "nutrition": "310 kcal • 31g Protein • 12g Carbs • 18g Fats"},
                    {"name": "Baked Sweet Potato", "quantity": "200g (1 large)", "nutrition": "172 kcal • 3g Protein • 40g Carbs"},
                    {"name": "Thick Red Lentil Dal", "quantity": "150g cooked", "nutrition": "170 kcal • 12g Protein • 28g Carbs"},
                    {"name": "Nutritional Yeast Seasoning", "quantity": "10g (2 tbsp)", "nutrition": "40 kcal • 5g Protein • 3g Carbs"}
                ]
            }
        ]

    elif is_veg:
        focus = (
            "Vegetarian Dairy & Plant Synergies: Low-fat paneer, Greek yogurt, whole lentils, organic tofu, "
            "quinoa, whole milk, seeds, and nuts. Lacto-vegetarian friendly."
        )
        grocery = [
            "Low-fat Fresh Paneer (800g)",
            "Plain Greek Yogurt (1kg)",
            "Organic Extra-Firm Tofu (400g)",
            "Yellow Moong & Black Urad Dal (1kg)",
            "Whole Rolled Oats (1kg)",
            "Organic Brown Basmati Rice (1kg)",
            "Raw Almonds & Cashews (250g)",
            "Baby Spinach & Broccoli (500g)",
            "Whey Protein Concentrate / Isolate (1kg)",
            "Extra Virgin Cold-Pressed Ghee / Olive Oil (250g)"
        ]

        meals = [
            {
                "meal_name": "Breakfast: Greek Yogurt & Protein Oatmeal",
                "meal_calories": int(round(target_calories * 0.25)),
                "protein_g": int(round(protein_g * 0.25)),
                "carbs_g": int(round(carbs_g * 0.25)),
                "fats_g": int(round(fats_g * 0.25)),
                "foods": [
                    {"name": "Rolled Oats w/ Warm Milk", "quantity": "70g oats + 150ml milk", "nutrition": "320 kcal • 12g Protein • 52g Carbs"},
                    {"name": "Unsweetened Greek Yogurt", "quantity": "150g", "nutrition": "130 kcal • 15g Protein • 6g Carbs"},
                    {"name": "Whey Protein Scoop", "quantity": "1 scoop (30g)", "nutrition": "120 kcal • 24g Protein • 2g Carbs"},
                    {"name": "Chia Seeds & Sliced Apple", "quantity": "10g seeds + 1 apple", "nutrition": "115 kcal • 2g Protein • 25g Carbs"}
                ]
            },
            {
                "meal_name": "Lunch: Sautéed Paneer & Brown Rice Thali",
                "meal_calories": int(round(target_calories * 0.35)),
                "protein_g": int(round(protein_g * 0.35)),
                "carbs_g": int(round(carbs_g * 0.35)),
                "fats_g": int(round(fats_g * 0.35)),
                "foods": [
                    {"name": "Low-fat Paneer (Grilled/Cubes)", "quantity": "180g", "nutrition": "320 kcal • 32g Protein • 8g Carbs • 18g Fats"},
                    {"name": "Cooked Brown Basmati Rice", "quantity": "160g", "nutrition": "210 kcal • 5g Protein • 44g Carbs"},
                    {"name": "Thick Moong Dal Soup", "quantity": "150g (1 bowl)", "nutrition": "160 kcal • 11g Protein • 26g Carbs"},
                    {"name": "Steamed Spinach & Broccoli", "quantity": "150g", "nutrition": "45 kcal • 4g Protein • 7g Carbs"}
                ]
            },
            {
                "meal_name": "Pre/Post-Workout: Muscle Synthesis Snack",
                "meal_calories": int(round(target_calories * 0.15)),
                "protein_g": int(round(protein_g * 0.15)),
                "carbs_g": int(round(carbs_g * 0.15)),
                "fats_g": int(round(fats_g * 0.15)),
                "foods": [
                    {"name": "Ripe Banana", "quantity": "1 medium (118g)", "nutrition": "105 kcal • 1g Protein • 27g Carbs"},
                    {"name": "Raw Almonds", "quantity": "25g (approx 20 nuts)", "nutrition": "150 kcal • 5g Protein • 5g Carbs • 13g Fats"},
                    {"name": "Sprouted Moong Salad", "quantity": "80g", "nutrition": "85 kcal • 6g Protein • 15g Carbs"}
                ]
            },
            {
                "meal_name": "Dinner: Paneer Bhurji / Tofu w/ Sweet Potato",
                "meal_calories": int(round(target_calories * 0.25)),
                "protein_g": int(round(protein_g * 0.25)),
                "carbs_g": int(round(carbs_g * 0.25)),
                "fats_g": int(round(fats_g * 0.25)),
                "foods": [
                    {"name": "Spiced Paneer / Tofu Bhurji", "quantity": "160g", "nutrition": "290 kcal • 28g Protein • 6g Carbs • 17g Fats"},
                    {"name": "Roasted Sweet Potato", "quantity": "180g", "nutrition": "155 kcal • 3g Protein • 36g Carbs"},
                    {"name": "Mixed Sprout Salad w/ Lemon", "quantity": "100g", "nutrition": "90 kcal • 7g Protein • 16g Carbs"}
                ]
            }
        ]

    else:
        # Non-Vegetarian
        focus = (
            "Lean Animal Proteins & Bioavailable Amino Acids: Skinless chicken breast, wild-caught salmon/tilapia, "
            "omega-3 pasture eggs, Greek yogurt, sweet potatoes, and leafy greens."
        )
        grocery = [
            "Boneless Skinless Chicken Breast (1.2kg)",
            "Fresh Salmon / Tilapia Fillets (600g)",
            "Omega-3 Pasture Eggs (2 Dozen)",
            "Plain Greek Yogurt (1kg)",
            "Organic Sweet Potatoes & Brown Rice (1.5kg)",
            "Whole Rolled Oats (1kg)",
            "Broccoli Florets & Asparagus (600g)",
            "Avocados (3 pieces)",
            "Cold-Pressed Extra Virgin Olive Oil (500ml)",
            "Whey Protein Isolate (1kg)"
        ]

        meals = [
            {
                "meal_name": "Breakfast: Anabolic Scramble & Oats",
                "meal_calories": int(round(target_calories * 0.25)),
                "protein_g": int(round(protein_g * 0.25)),
                "carbs_g": int(round(carbs_g * 0.25)),
                "fats_g": int(round(fats_g * 0.25)),
                "foods": [
                    {"name": "Whole Eggs + Egg Whites", "quantity": "2 whole + 2 whites", "nutrition": "210 kcal • 24g Protein • 1g Carbs • 11g Fats"},
                    {"name": "Whole Rolled Oats w/ Water", "quantity": "70g dry", "nutrition": "260 kcal • 9g Protein • 47g Carbs • 4g Fats"},
                    {"name": "Greek Yogurt & Berries", "quantity": "100g yogurt + 50g berries", "nutrition": "110 kcal • 10g Protein • 14g Carbs"}
                ]
            },
            {
                "meal_name": "Lunch: Herb Grilled Chicken & Sweet Potato",
                "meal_calories": int(round(target_calories * 0.35)),
                "protein_g": int(round(protein_g * 0.35)),
                "carbs_g": int(round(carbs_g * 0.35)),
                "fats_g": int(round(fats_g * 0.35)),
                "foods": [
                    {"name": "Grilled Skinless Chicken Breast", "quantity": "200g cooked", "nutrition": "330 kcal • 62g Protein • 0g Carbs • 7g Fats"},
                    {"name": "Baked Sweet Potato", "quantity": "200g", "nutrition": "172 kcal • 3g Protein • 40g Carbs"},
                    {"name": "Steamed Asparagus & Broccoli", "quantity": "150g", "nutrition": "50 kcal • 4g Protein • 8g Carbs"},
                    {"name": "Extra Virgin Olive Oil Drizzle", "quantity": "10ml (1 tbsp)", "nutrition": "90 kcal • 0g Protein • 10g Fats"}
                ]
            },
            {
                "meal_name": "Pre/Post-Workout: Fast Protein & Carbs",
                "meal_calories": int(round(target_calories * 0.15)),
                "protein_g": int(round(protein_g * 0.15)),
                "carbs_g": int(round(carbs_g * 0.15)),
                "fats_g": int(round(fats_g * 0.15)),
                "foods": [
                    {"name": "Whey Protein Isolate Shake", "quantity": "1 scoop (30g) in water", "nutrition": "120 kcal • 27g Protein • 1g Carbs"},
                    {"name": "Ripe Medium Banana", "quantity": "1 medium (118g)", "nutrition": "105 kcal • 1g Protein • 27g Carbs"},
                    {"name": "Raw Almonds", "quantity": "15g", "nutrition": "90 kcal • 3g Protein • 3g Carbs • 8g Fats"}
                ]
            },
            {
                "meal_name": "Dinner: Pan-Seared Salmon & Quinoa Bowl",
                "meal_calories": int(round(target_calories * 0.25)),
                "protein_g": int(round(protein_g * 0.25)),
                "carbs_g": int(round(carbs_g * 0.25)),
                "fats_g": int(round(fats_g * 0.25)),
                "foods": [
                    {"name": "Fresh Wild Salmon Fillet", "quantity": "180g", "nutrition": "370 kcal • 40g Protein • 0g Carbs • 22g Fats (Omega-3)"},
                    {"name": "Cooked Organic Quinoa", "quantity": "150g", "nutrition": "180 kcal • 6g Protein • 32g Carbs"},
                    {"name": "Garden Salad w/ Lemon Dressing", "quantity": "150g mixed bowl", "nutrition": "40 kcal • 2g Protein • 6g Carbs"}
                ]
            }
        ]

    return {
        "bmi": bmi,
        "bmi_category": bmi_cat,
        "bmi_message": bmi_msg,
        "bmr_kcal": bmr,
        "tdee_kcal": tdee,
        "water_liters": water_liters,
        "fiber_g": fiber_g,
        "strategy": strategy,
        "food_focus": focus,
        "grocery": grocery,
        "macros": {
            "calories": target_calories,
            "protein_g": protein_g,
            "carbs_g": carbs_g,
            "fats_g": fats_g
        },
        "meals": meals
    }
