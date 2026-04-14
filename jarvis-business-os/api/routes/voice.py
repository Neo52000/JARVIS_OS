"""API Routes — Voice (STT + TTS)."""
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import Response
from pydantic import BaseModel
from voice import stt, tts

router = APIRouter(prefix="/voice", tags=["Voice"])


class TTSRequest(BaseModel):
    text: str
    voice: str = "fr-FR-HenriNeural"


@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...), language: str = "fr"):
    if not stt.is_available():
        raise HTTPException(status_code=503, detail="Whisper not installed")
    audio_bytes = await file.read()
    result = await stt.transcribe(audio_bytes, language)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return {"status": "ok", "text": result["text"]}


@router.post("/speak")
async def speak(req: TTSRequest):
    if not tts.is_available():
        raise HTTPException(status_code=503, detail="edge-tts not installed")
    audio = await tts.synthesize(req.text, req.voice)
    if audio is None:
        raise HTTPException(status_code=500, detail="TTS synthesis failed")
    return Response(content=audio, media_type="audio/mpeg")


@router.get("/voices")
async def list_voices(language: str = "fr"):
    voices = await tts.list_voices(language)
    return {"status": "ok", "voices": voices}


@router.get("/status")
async def voice_status():
    return {"stt_available": stt.is_available(), "tts_available": tts.is_available()}
