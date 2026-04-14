from datetime import datetime

from pydantic import BaseModel


class EventCreate(BaseModel):
    title: str
    description: str | None = None
    start_time: datetime
    end_time: datetime
    location: str | None = None
    all_day: bool = False


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    location: str | None = None
    all_day: bool | None = None


class EventResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str | None
    start_time: datetime
    end_time: datetime
    location: str | None
    all_day: bool
    created_at: datetime

    model_config = {"from_attributes": True}
