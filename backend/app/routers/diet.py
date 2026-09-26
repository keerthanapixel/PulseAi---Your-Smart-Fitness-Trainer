from fastapi import APIRouter, HTTPException
from ..schemas import DietRequest, DietResponse
from ..services.diet_service import calculate_diet_plan

router = APIRouter(prefix="/diet", tags=["AI Dietician"])

@router.post("", response_model=DietResponse, summary="Generate personalized nutrition and macro profile")
async def generate_diet(payload: DietRequest):
    try:
        result = calculate_diet_plan(
            weight_kg=payload.weight_kg,
            height_cm=payload.height_cm,
            goal=payload.goal,
            preference=payload.preference,
            target_calories=payload.target_calories or 2000
        )
        return DietResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate diet profile: {str(e)}")
