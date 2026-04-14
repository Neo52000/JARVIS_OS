"""Text-to-Speech — EdgeTTS integration."""
import tempfile
import logging
from pathlib import Path

log = logging.getLogger("jarvis.voice.tts")


async def synthesize(text: str, voice: str = "fr-FR-HenriNeural") -> bytes | None:
    try:
        import edge_tts
    except ImportError:
        log.warning("edge-tts not installed. Run: pip install edge-tts")
        return None

    try:
        communicate = edge_tts.Communicate(text, voice)
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
            tmp_path = f.name

        await communicate.save(tmp_path)
        audio_bytes = Path(tmp_path).read_bytes()
        Path(tmp_path).unlink(missing_ok=True)
        log.info(f"Synthesized {len(audio_bytes)} bytes for: {text[:50]}...")
        return audio_bytes
    except Exception as e:
        log.error(f"TTS failed: {e}")
        return None


async def list_voices(language: str = "fr") -> list[dict]:
    try:
        import edge_tts
        voices = await edge_tts.list_voices()
        return [
            {"name": v["ShortName"], "gender": v["Gender"], "locale": v["Locale"]}
            for v in voices
            if v["Locale"].startswith(language)
        ]
    except ImportError:
        return []


def is_available() -> bool:
    try:
        import edge_tts
        return True
    except ImportError:
        return False
