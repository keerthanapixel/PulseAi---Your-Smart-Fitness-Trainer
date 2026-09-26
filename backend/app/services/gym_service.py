from typing import Dict, Any, List

GYM_DIRECTORY: Dict[str, List[Dict[str, Any]]] = {
    "bangalore": [
        {
            "name": "Cult.fit Elite",
            "area": "Indiranagar / Koramangala",
            "type": "HIIT, Boxing & Functional Strength",
            "rating": 4.8,
            "open_hours": "06:00 AM - 10:00 PM",
            "tags": ["Group Classes", "Turf Area", "Olympic Weights"]
        },
        {
            "name": "Anytime Fitness 24/7",
            "area": "Bellandur / Electronic City",
            "type": "24/7 Access, Free Weights & Cardio",
            "rating": 4.6,
            "open_hours": "Open 24 Hours",
            "tags": ["24/7 Access", "Keycard Entry", "Private Showers"]
        },
        {
            "name": "Volt Luxury Fitness",
            "area": "100ft Road, Indiranagar",
            "type": "Biomechanics & High-Performance Strength",
            "rating": 4.7,
            "open_hours": "05:30 AM - 10:30 PM",
            "tags": ["Sauna", "InBody Analysis", "Elite Coaches"]
        },
        {
            "name": "Gold's Gym",
            "area": "HSR Layout / Whitefield",
            "type": "Old-School Bodybuilding & Heavy Free Weights",
            "rating": 4.5,
            "open_hours": "06:00 AM - 10:00 PM",
            "tags": ["Heavy Dumbbells", "Squat Racks", "Steam Room"]
        }
    ],
    "chennai": [
        {
            "name": "Slam Lifestyle and Fitness",
            "area": "T. Nagar / Adyar",
            "type": "Strength Conditioning & Cross-Training",
            "rating": 4.7,
            "open_hours": "05:30 AM - 10:00 PM",
            "tags": ["Powerlifting", "Functional Turf", "Cardio Deck"]
        },
        {
            "name": "Fitness One",
            "area": "Alwarpet / Anna Nagar",
            "type": "Cardiovascular Rehab & Resistance Training",
            "rating": 4.4,
            "open_hours": "06:00 AM - 09:30 PM",
            "tags": ["Aerobics", "Physiotherapy", "Spin Studio"]
        },
        {
            "name": "Cult.fit Anna Nagar",
            "area": "2nd Avenue, Anna Nagar",
            "type": "HIIT, S&C and Yoga",
            "rating": 4.8,
            "open_hours": "06:00 AM - 10:00 PM",
            "tags": ["App Booking", "Guided Workouts", "Locker Room"]
        }
    ],
    "mumbai": [
        {
            "name": "Nitrrro Wellness Sanctuary",
            "area": "Bandra West / Breach Candy",
            "type": "Ultra-Luxury Functional Strength",
            "rating": 4.9,
            "open_hours": "06:00 AM - Midnight",
            "tags": ["Oxygen Bar", "Rooftop Pool", "Biostrength"]
        },
        {
            "name": "Gold's Gym Bandra",
            "area": "Pali Hill, Bandra",
            "type": "Hypertrophy & Elite Physique Training",
            "rating": 4.6,
            "open_hours": "06:00 AM - 10:30 PM",
            "tags": ["Celebrity Trainers", "Deadlift Platforms", "Cafe"]
        }
    ],
    "delhi": [
        {
            "name": "Anytime Fitness GK-2",
            "area": "Greater Kailash 2 / Saket",
            "type": "Round-The-Clock Strength & Cardio",
            "rating": 4.7,
            "open_hours": "Open 24 Hours",
            "tags": ["24/7", "Cardio Theaters", "Personal Coaching"]
        },
        {
            "name": "Cult.fit Connaught Place",
            "area": "Barakhamba Road, CP",
            "type": "Functional Movement & Boxing",
            "rating": 4.8,
            "open_hours": "06:00 AM - 10:00 PM",
            "tags": ["Group Workouts", "Shower Suites", "Heart Rate Sync"]
        }
    ]
}

DEFAULT_GYMS = [
    {
        "name": "Cult.fit Center (Nearby Hub)",
        "area": "Metro Central Hub",
        "type": "Functional Fitness & Group HIIT",
        "rating": 4.7,
        "open_hours": "06:00 AM - 10:00 PM",
        "tags": ["Functional Zone", "App Check-in", "Free Trial"]
    },
    {
        "name": "Anytime Fitness Express",
        "area": "Main Commercial District",
        "type": "24/7 Access Strength & Mobility",
        "rating": 4.5,
        "open_hours": "Open 24 Hours",
        "tags": ["Keycard Access", "Cardio Row", "Free Weights"]
    },
    {
        "name": "Iron Paradise Gym",
        "area": "City Center",
        "type": "Powerlifting & Hypertrophy Focus",
        "rating": 4.6,
        "open_hours": "05:30 AM - 10:30 PM",
        "tags": ["Squat Racks", "Chalk Allowed", "Posing Room"]
    }
]

def find_gyms_and_routine(location: str) -> Dict[str, Any]:
    loc_clean = location.strip().lower()
    
    city_key = None
    if any(k in loc_clean for k in ["blr", "bangalore", "bengaluru", "indiranagar", "koramangala", "whitefield"]):
        city_key = "bangalore"
    elif any(k in loc_clean for k in ["chennai", "madras", "adyar", "t nagar", "anna nagar"]):
        city_key = "chennai"
    elif any(k in loc_clean for k in ["mumbai", "bombay", "bandra", "andheri"]):
        city_key = "mumbai"
    elif any(k in loc_clean for k in ["delhi", "ncr", "gurgaon", "noida", "cp"]):
        city_key = "delhi"
        
    if city_key:
        display_city = city_key.capitalize()
        gym_list = GYM_DIRECTORY.get(city_key, DEFAULT_GYMS)
    else:
        display_city = location.strip().capitalize() if location.strip() else "Your Area"
        gym_list = DEFAULT_GYMS

    daily_routine = {
        "title": "Hackathon Metabolic Quad & Core Burner",
        "duration_min": 40,
        "level": "All Levels",
        "exercises": [
            {"name": "Bodyweight Deep Squats (Tracked with AI Coach)", "sets": "4 sets × 15-20 reps"},
            {"name": "Bulgarian Split Squats", "sets": "3 sets × 12 reps / leg"},
            {"name": "Dumbbell Romanian Deadlifts", "sets": "3 sets × 12 reps"},
            {"name": "Plank Shoulder Taps", "sets": "3 sets × 45 seconds"},
            {"name": "Wall Sit Finisher", "sets": "2 sets to failure"}
        ]
    }

    daily_challenge = {
        "title": "The Century Squat Form Challenge",
        "description": "Perform 50 squats in under 2 minutes with AI camera tracking! Maintain depth below 90° for every rep to pass validation.",
        "reward_xp": 250
    }

    return {
        "city": display_city,
        "gyms": gym_list,
        "daily_routine": daily_routine,
        "daily_challenge": daily_challenge
    }
