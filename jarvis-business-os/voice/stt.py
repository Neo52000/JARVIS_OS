"""Speech-to-Text — Whisper integration."""
import tempfile
import logging
from pathlib import Path

log = logging.getLogger("jarvis.voice.stt")

_model = None


def _get_model():
    global _model
    if _model is None:
        try:
            import whisper
            from config import settings
            log.info(f"Loading Whisper model: {settings.WHISPER_MODEL}")
            _model = whisper.load_model(settings.WHISPER_MODEL)
        except ImportError:
            log.warning("Whisper not installed. Run: pip install openai-whisper")
            return None
    return _model


async def transcribe(audio_bytes: bytes, language: str = "fr") -> dict:
    model = _get_model()
    if model is None:
        return {"text": "", "error": "Whisper not available"}

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(audio_bytes)
        tmp_path = f.name

    try:
        result = model.transcribe(tmp_path, language=language)
        text = result.get("text", "").strip()
        log.info(f"Transcribed: {text[:80]}...")
        return {"text": text, "language": language}
    except Exception as e:
        log.error(f"Transcription failed: {e}")
        return {"text": "", "error": str(e)}
    finally:
        Path(tmp_path).unlink(missing_ok=True)


def is_available() -> bool:
    try:
        import whisper
        return True
    except ImportError:
        return False
