from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.modules.auth.models import User
from app.modules.ai.schemas import ChatRequest, ChatResponse
from app.modules.ai.service import get_ai_response

router = APIRouter(prefix="/ai", tags=["AI Assistant"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    data: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    result = await get_ai_response(data.messages)
    return ChatResponse(**result)
