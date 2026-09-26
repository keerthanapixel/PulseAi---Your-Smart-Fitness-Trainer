from fastapi import APIRouter, HTTPException
from ..schemas import GymRequest, GymResponse
from ..services.gym_service import find_gyms_and_routine

router = APIRouter(prefix="/gym", tags=["Gym Recommender"])

@router.post("", response_model=GymResponse, summary="Find gyms and daily workout routines by location")
async def recommend_gyms(payload: GymRequest):
    try:
        result = find_gyms_and_routine(payload.location)
        return GymResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to find gym recommendations: {str(e)}")
