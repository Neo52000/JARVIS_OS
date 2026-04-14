import httpx
from fastapi import HTTPException, status

from app.config import settings
from app.modules.ai.schemas import ChatMessage

SYSTEM_PROMPT = (
    "You are JARVIS, an AI business assistant. You help users manage their "
    "business operations including tasks, contacts, calendar events, and notes. "
    "Be concise, professional, and helpful. When asked about business topics, "
    "provide actionable advice."
)


async def get_ai_response(messages: list[ChatMessage]) -> dict:
    if not settings.openai_api_key:
        return {
            "reply": (
                "AI assistant is not configured. Please set your OPENAI_API_KEY "
                "in the environment variables to enable AI chat."
            ),
            "usage": None,
        }

    api_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in messages:
        api_messages.append({"role": msg.role, "content": msg.content})

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.openai_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": api_messages,
                    "max_tokens": 1000,
                    "temperature": 0.7,
                },
                timeout=30.0,
            )
            response.raise_for_status()
            data = response.json()
            return {
                "reply": data["choices"][0]["message"]["content"],
                "usage": data.get("usage"),
            }
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {e.response.status_code}",
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not connect to AI service",
        )
