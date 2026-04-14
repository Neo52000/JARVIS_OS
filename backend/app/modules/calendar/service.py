from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.calendar.models import Event
from app.modules.calendar.schemas import EventCreate, EventUpdate


def get_events_in_range(
    db: Session, user_id: str, start: datetime, end: datetime
) -> list[Event]:
    return (
        db.query(Event)
        .filter(
            Event.user_id == user_id,
            Event.start_time <= end,
            Event.end_time >= start,
        )
        .order_by(Event.start_time)
        .all()
    )


def get_event(db: Session, event_id: str, user_id: str) -> Event:
    event = (
        db.query(Event)
        .filter(Event.id == event_id, Event.user_id == user_id)
        .first()
    )
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event


def create_event(db: Session, user_id: str, data: EventCreate) -> Event:
    event = Event(user_id=user_id, **data.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def update_event(
    db: Session, event_id: str, user_id: str, data: EventUpdate
) -> Event:
    event = get_event(db, event_id, user_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    db.commit()
    db.refresh(event)
    return event


def delete_event(db: Session, event_id: str, user_id: str) -> None:
    event = get_event(db, event_id, user_id)
    db.delete(event)
    db.commit()


def get_upcoming_events(db: Session, user_id: str, limit: int = 5) -> list[Event]:
    from datetime import timezone
    now = datetime.now(timezone.utc)
    return (
        db.query(Event)
        .filter(Event.user_id == user_id, Event.start_time >= now)
        .order_by(Event.start_time)
        .limit(limit)
        .all()
    )
