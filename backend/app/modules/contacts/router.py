from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.modules.auth.models import User
from app.modules.contacts.schemas import ContactCreate, ContactResponse, ContactUpdate
from app.modules.contacts.service import (
    create_contact,
    delete_contact,
    get_contact,
    get_contacts,
    update_contact,
)

router = APIRouter(prefix="/contacts", tags=["Contacts"])


@router.get("", response_model=list[ContactResponse])
def list_contacts(
    search: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_contacts(db, current_user.id, search=search, skip=skip, limit=limit)


@router.post("", response_model=ContactResponse, status_code=201)
def create(
    data: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_contact(db, current_user.id, data)


@router.get("/{contact_id}", response_model=ContactResponse)
def read(
    contact_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_contact(db, contact_id, current_user.id)


@router.put("/{contact_id}", response_model=ContactResponse)
def update(
    contact_id: str,
    data: ContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_contact(db, contact_id, current_user.id, data)


@router.delete("/{contact_id}", status_code=204)
def delete(
    contact_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_contact(db, contact_id, current_user.id)
