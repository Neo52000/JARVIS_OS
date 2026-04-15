"""Scheduler — Automated recurring tasks via APScheduler."""
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

log = logging.getLogger("jarvis.scheduler")

scheduler = AsyncIOScheduler()
_registered_jobs: list[dict] = []


def start():
    """Start the scheduler."""
    if not scheduler.running:
        scheduler.start()
        log.info("Scheduler started")


def stop():
    """Stop the scheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        log.info("Scheduler stopped")


def add_daily_job(func, hour: int = 9, minute: int = 0, job_id: str = "", **kwargs):
    """Schedule a daily task at a specific time."""
    job_id = job_id or f"daily_{func.__name__}_{hour}h{minute}"
    scheduler.add_job(
        func,
        trigger=CronTrigger(hour=hour, minute=minute),
        id=job_id,
        replace_existing=True,
        kwargs=kwargs,
    )
    _registered_jobs.append({
        "id": job_id,
        "type": "daily",
        "time": f"{hour:02d}:{minute:02d}",
        "function": func.__name__,
    })
    log.info(f"Scheduled daily job: {job_id} at {hour:02d}:{minute:02d}")
    return job_id


def add_interval_job(func, hours: int = 0, minutes: int = 30, job_id: str = "", **kwargs):
    """Schedule a recurring task at fixed intervals."""
    job_id = job_id or f"interval_{func.__name__}_{hours}h{minutes}m"
    scheduler.add_job(
        func,
        trigger=IntervalTrigger(hours=hours, minutes=minutes),
        id=job_id,
        replace_existing=True,
        kwargs=kwargs,
    )
    _registered_jobs.append({
        "id": job_id,
        "type": "interval",
        "interval": f"{hours}h{minutes}m",
        "function": func.__name__,
    })
    log.info(f"Scheduled interval job: {job_id} every {hours}h{minutes}m")
    return job_id


def remove_job(job_id: str) -> bool:
    """Remove a scheduled job."""
    try:
        scheduler.remove_job(job_id)
        _registered_jobs[:] = [j for j in _registered_jobs if j["id"] != job_id]
        log.info(f"Removed job: {job_id}")
        return True
    except Exception:
        return False


def list_jobs() -> list[dict]:
    """List all registered jobs."""
    return _registered_jobs.copy()
