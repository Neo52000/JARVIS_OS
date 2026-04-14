from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.contacts.models import Contact
from app.modules.contacts.schemas import ContactCreate, ContactUpdate


def get_contacts(
    db: Session,
    user_id: str,
    search: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[Contact]:
    query = db.query(Contact).filter(Contact.user_id == user_id)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            Contact.name.ilike(pattern)
            | Contact.email.ilike(pattern)
            | Contact.company.ilike(pattern)
        )
    return query.order_by(Contact.created_at.desc()).offset(skip).limit(limit).all()


def get_contact(db: Session, contact_id: str, user_id: str) -> Contact:
    contact = (
        db.query(Contact)
        .filter(Contact.id == contact_id, Contact.user_id == user_id)
        .first()
    )
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    return contact


def create_contact(db: Session, user_id: str, data: ContactCreate) -> Contact:
    contact = Contact(user_id=user_id, **data.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


def update_contact(
    db: Session, contact_id: str, user_id: str, data: ContactUpdate
) -> Contact:
    contact = get_contact(db, contact_id, user_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(contact, field, value)
    db.commit()
    db.refresh(contact)
    return contact


def delete_contact(db: Session, contact_id: str, user_id: str) -> None:
    contact = get_contact(db, contact_id, user_id)
    db.delete(contact)
    db.commit()
