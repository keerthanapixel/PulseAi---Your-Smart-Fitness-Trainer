from fastapi import APIRouter, HTTPException
from ..schemas import ChatRequest, ChatResponse
from ..services.chatbot_service import analyze_and_respond

router = APIRouter(prefix="/chat", tags=["Virtual Gym Buddy"])

@router.post("", response_model=ChatResponse, summary="Send message to Virtual Gym Buddy")
async def chat_with_buddy(payload: ChatRequest):
    try:
        result = analyze_and_respond(payload.message)
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process chat: {str(e)}")
