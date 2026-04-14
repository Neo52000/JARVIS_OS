from datetime import datetime

from pydantic import BaseModel


class UpcomingEvent(BaseModel):
    id: str
    title: str
    start_time: datetime

    model_config = {"from_attributes": True}


class RecentNote(BaseModel):
    id: str
    title: str
    updated_at: datetime

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_contacts: int
    tasks_by_status: dict[str, int]
    tasks_due_today: int
    upcoming_events: list[UpcomingEvent]
    recent_notes: list[RecentNote]
