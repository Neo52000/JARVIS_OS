from datetime import datetime

from pydantic import BaseModel


class NoteCreate(BaseModel):
    title: str
    content: str | None = ""
    tags: list[str] | None = []
    is_pinned: bool = False


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    tags: list[str] | None = None
    is_pinned: bool | None = None


class NoteResponse(BaseModel):
    id: str
    user_id: str
    title: str
    content: str | None
    tags: list[str] | None
    is_pinned: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
