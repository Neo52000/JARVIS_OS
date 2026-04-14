"""API Routes — Scheduler (automated tasks)."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core import scheduler
from workflows.automated_tasks import (
    daily_pod_generation,
    daily_content_generation,
    weekly_report,
)

router = APIRouter(prefix="/scheduler", tags=["Scheduler"])


class PodScheduleRequest(BaseModel):
    niche: str = "trending"
    count: int = 3
    style: str = "modern minimalist"
    hour: int = 9
    minute: int = 0


class ContentScheduleRequest(BaseModel):
    hour: int = 8
    minute: int = 0


@router.post("/pod/daily")
async def schedule_daily_pod(req: PodScheduleRequest):
    job_id = scheduler.add_daily_job(
        daily_pod_generation, hour=req.hour, minute=req.minute,
        job_id=f"daily_pod_{req.niche}", niche=req.niche, count=req.count, style=req.style,
    )
    return {"status": "ok", "job_id": job_id, "schedule": f"Daily at {req.hour:02d}:{req.minute:02d}"}


@router.post("/content/daily")
async def schedule_daily_content(req: ContentScheduleRequest):
    job_id = scheduler.add_daily_job(
        daily_content_generation, hour=req.hour, minute=req.minute,
        job_id="daily_content_all_clients",
    )
    return {"status": "ok", "job_id": job_id, "schedule": f"Daily at {req.hour:02d}:{req.minute:02d}"}


@router.post("/report/weekly")
async def schedule_weekly_report():
    job_id = scheduler.add_daily_job(
        weekly_report, hour=9, minute=0, job_id="weekly_report",
    )
    return {"status": "ok", "job_id": job_id, "schedule": "Daily 09:00"}


@router.get("/jobs")
async def list_jobs():
    jobs = scheduler.list_jobs()
    return {"status": "ok", "jobs": jobs, "count": len(jobs)}


@router.delete("/jobs/{job_id}")
async def remove_job(job_id: str):
    success = scheduler.remove_job(job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": "ok", "message": f"Job {job_id} removed"}


@router.post("/run/pod")
async def run_pod_now(req: PodScheduleRequest):
    result = await daily_pod_generation(req.niche, req.count, req.style)
    if result is None:
        raise HTTPException(status_code=500, detail="POD generation failed")
    return {"status": "ok", "result": result}


@router.post("/run/content")
async def run_content_now():
    result = await daily_content_generation()
    return {"status": "ok", "result": result}


@router.post("/run/report")
async def run_report_now():
    result = await weekly_report()
    return {"status": "ok", "report": result}
