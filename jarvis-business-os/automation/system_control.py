"""System Control — Local automation (safe operations only)."""
import os
import subprocess
import platform
import logging

log = logging.getLogger("jarvis.automation")

ALLOWED_EXTENSIONS = {".txt", ".json", ".csv", ".md", ".py", ".html", ".css", ".js"}


def open_application(app_name: str) -> dict:
    system = platform.system()
    try:
        if system == "Windows":
            os.startfile(app_name)
        elif system == "Darwin":
            subprocess.Popen(["open", "-a", app_name])
        else:
            subprocess.Popen([app_name])
        log.info(f"Opened application: {app_name}")
        return {"status": "ok", "app": app_name}
    except Exception as e:
        log.error(f"Failed to open {app_name}: {e}")
        return {"status": "error", "error": str(e)}


def open_url(url: str) -> dict:
    import webbrowser
    try:
        webbrowser.open(url)
        return {"status": "ok", "url": url}
    except Exception as e:
        return {"status": "error", "error": str(e)}


def list_files(directory: str, extension: str = "") -> list[str]:
    try:
        path = os.path.expanduser(directory)
        files = []
        for f in os.listdir(path):
            if f.startswith("."):
                continue
            if extension and not f.endswith(extension):
                continue
            files.append(f)
        return sorted(files)
    except Exception as e:
        log.error(f"List files failed: {e}")
        return []


def get_system_info() -> dict:
    return {
        "os": platform.system(),
        "os_version": platform.version(),
        "machine": platform.machine(),
        "python": platform.python_version(),
        "hostname": platform.node(),
    }


def create_file(filepath: str, content: str) -> dict:
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return {"status": "error", "error": f"Extension {ext} not allowed. Allowed: {ALLOWED_EXTENSIONS}"}
    try:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        log.info(f"Created file: {filepath}")
        return {"status": "ok", "filepath": filepath}
    except Exception as e:
        return {"status": "error", "error": str(e)}
