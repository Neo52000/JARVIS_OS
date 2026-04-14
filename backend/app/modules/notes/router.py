from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.modules.auth.models import User
from app.modules.notes.schemas import NoteCreate, NoteResponse, NoteUpdate
from app.modules.notes.service import (
    create_note,
    delete_note,
    get_note,
    get_notes,
    update_note,
)

router = APIRouter(prefix="/notes", tags=["Notes"])


@router.get("", response_model=list[NoteResponse])
def list_notes(
    search: str | None = Query(None),
    tag: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_notes(db, current_user.id, search=search, tag=tag, skip=skip, limit=limit)


@router.post("", response_model=NoteResponse, status_code=201)
def create(
    data: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_note(db, current_user.id, data)


@router.get("/{note_id}", response_model=NoteResponse)
def read(
    note_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_note(db, note_id, current_user.id)


@router.put("/{note_id}", response_model=NoteResponse)
def update(
    note_id: str,
    data: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_note(db, note_id, current_user.id, data)


@router.delete("/{note_id}", status_code=204)
def delete(
    note_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_note(db, note_id, current_user.id)
