from datetime import datetime, timezone, timedelta

from sqlalchemy.orm import Session

from app.modules.contacts.models import Contact
from app.modules.tasks.service import count_tasks_by_status
from app.modules.tasks.models import Task
from app.modules.calendar.service import get_upcoming_events
from app.modules.notes.service import get_recent_notes


def get_dashboard_stats(db: Session, user_id: str) -> dict:
    total_contacts = db.query(Contact).filter(Contact.user_id == user_id).count()

    tasks_by_status = count_tasks_by_status(db, user_id)

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    tasks_due_today = (
        db.query(Task)
        .filter(
            Task.user_id == user_id,
            Task.due_date >= today_start,
            Task.due_date < today_end,
            Task.status != "done",
        )
        .count()
    )

    upcoming_events = get_upcoming_events(db, user_id, limit=5)
    recent_notes = get_recent_notes(db, user_id, limit=5)

    return {
        "total_contacts": total_contacts,
        "tasks_by_status": tasks_by_status,
        "tasks_due_today": tasks_due_today,
        "upcoming_events": upcoming_events,
        "recent_notes": recent_notes,
    }
