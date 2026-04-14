from datetime import datetime

from pydantic import BaseModel


class ContactCreate(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    position: str | None = None
    notes: str | None = None


class ContactUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    position: str | None = None
    notes: str | None = None


class ContactResponse(BaseModel):
    id: str
    user_id: str
    name: str
    email: str | None
    phone: str | None
    company: str | None
    position: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
