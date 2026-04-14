from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.notes.models import Note
from app.modules.notes.schemas import NoteCreate, NoteUpdate


def get_notes(
    db: Session,
    user_id: str,
    search: str | None = None,
    tag: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[Note]:
    query = db.query(Note).filter(Note.user_id == user_id)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            Note.title.ilike(pattern) | Note.content.ilike(pattern)
        )
    if tag:
        query = query.filter(Note.tags.contains([tag]))
    return (
        query.order_by(Note.is_pinned.desc(), Note.updated_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_note(db: Session, note_id: str, user_id: str) -> Note:
    note = (
        db.query(Note)
        .filter(Note.id == note_id, Note.user_id == user_id)
        .first()
    )
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note


def create_note(db: Session, user_id: str, data: NoteCreate) -> Note:
    note = Note(user_id=user_id, **data.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def update_note(db: Session, note_id: str, user_id: str, data: NoteUpdate) -> Note:
    note = get_note(db, note_id, user_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(note, field, value)
    db.commit()
    db.refresh(note)
    return note


def delete_note(db: Session, note_id: str, user_id: str) -> None:
    note = get_note(db, note_id, user_id)
    db.delete(note)
    db.commit()


def get_recent_notes(db: Session, user_id: str, limit: int = 5) -> list[Note]:
    return (
        db.query(Note)
        .filter(Note.user_id == user_id)
        .order_by(Note.updated_at.desc())
        .limit(limit)
        .all()
    )
