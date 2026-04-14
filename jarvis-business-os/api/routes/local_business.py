"""API Routes — Local Business Automation."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from workflows import local_business_workflow as lb

router = APIRouter(prefix="/business", tags=["Local Business"])


class PostRequest(BaseModel):
    business_name: str
    business_type: str
    topic: str
    platform: str = "instagram"


class CalendarRequest(BaseModel):
    business_name: str
    business_type: str
    days: int = 7


class ClientRequest(BaseModel):
    name: str
    business_type: str
    location: str = ""
    notes: str = ""


class CampaignRequest(BaseModel):
    business_name: str
    objective: str
    budget_eur: float = 0
    duration_days: int = 30


@router.post("/post")
async def create_post(req: PostRequest):
    try:
        result = await lb.create_post(req.business_name, req.business_type, req.topic, req.platform)
        return {"status": "ok", "post": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/calendar")
async def create_calendar(req: CalendarRequest):
    try:
        result = await lb.create_calendar(req.business_name, req.business_type, req.days)
        return {"status": "ok", "calendar": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/client")
async def add_client(req: ClientRequest):
    try:
        result = await lb.add_client(req.name, req.business_type, req.location, req.notes)
        return {"status": "ok", "client": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/campaign")
async def create_campaign(req: CampaignRequest):
    try:
        result = await lb.create_campaign_plan(
            req.business_name, req.objective, req.budget_eur, req.duration_days
        )
        return {"status": "ok", "campaign": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/clients")
async def list_clients(limit: int = 50):
    clients = await lb.list_clients(limit)
    return {"status": "ok", "clients": clients, "count": len(clients)}


@router.get("/search")
async def search_content(q: str, limit: int = 10):
    results = await lb.search_content(q, limit)
    return {"status": "ok", "results": results}
