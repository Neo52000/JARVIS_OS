"""LLM client — Mistral API (primary) + Ollama fallback."""
import httpx
import json
import logging
from config import settings

log = logging.getLogger("jarvis.llm")


async def _call_mistral(messages: list[dict], temperature: float = 0.7, max_tokens: int = 2048) -> str:
    """Call Mistral API."""
    async with httpx.AsyncClient(timeout=settings.AGENT_TIMEOUT) as client:
        resp = await client.post(
            f"{settings.MISTRAL_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.MISTRAL_MODEL,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


async def _call_ollama(messages: list[dict], temperature: float = 0.7) -> str:
    """Fallback: local Ollama."""
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(
            f"{settings.OLLAMA_BASE_URL}/api/chat",
            json={
                "model": settings.OLLAMA_MODEL,
                "messages": messages,
                "stream": False,
                "options": {"temperature": temperature},
            },
        )
        resp.raise_for_status()
        return resp.json()["message"]["content"]


async def chat(
    messages: list[dict],
    system: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 2048,
) -> str:
    """Unified LLM call. Tries Mistral first, falls back to Ollama."""
    if system:
        messages = [{"role": "system", "content": system}] + messages

    if settings.USE_LOCAL_LLM:
        return await _call_ollama(messages, temperature)

    try:
        return await _call_mistral(messages, temperature, max_tokens)
    except Exception as e:
        log.warning(f"Mistral failed ({e}), falling back to Ollama")
        try:
            return await _call_ollama(messages, temperature)
        except Exception as e2:
            log.error(f"Ollama also failed: {e2}")
            return f"[LLM ERROR] Both Mistral and Ollama failed. Check your API key or Ollama service."


async def generate_json(
    prompt: str,
    system: str = "You are a JSON generator. Return ONLY valid JSON, no markdown fences.",
    temperature: float = 0.4,
) -> dict | list:
    """Ask LLM to return structured JSON."""
    raw = await chat([{"role": "user", "content": prompt}], system=system, temperature=temperature)
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    return json.loads(cleaned)
