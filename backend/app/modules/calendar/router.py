from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.modules.auth.models import User
from app.modules.calendar.schemas import EventCreate, EventResponse, EventUpdate
from app.modules.calendar.service import (
    create_event,
    delete_event,
    get_event,
    get_events_in_range,
    update_event,
)

router = APIRouter(prefix="/events", tags=["Calendar"])


@router.get("", response_model=list[EventResponse])
def list_events(
    start: datetime = Query(...),
    end: datetime = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_events_in_range(db, current_user.id, start, end)


@router.post("", response_model=EventResponse, status_code=201)
def create(
    data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_event(db, current_user.id, data)


@router.get("/{event_id}", response_model=EventResponse)
def read(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_event(db, event_id, current_user.id)


@router.put("/{event_id}", response_model=EventResponse)
def update(
    event_id: str,
    data: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_event(db, event_id, current_user.id, data)


@router.delete("/{event_id}", status_code=204)
def delete(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_event(db, event_id, current_user.id)
