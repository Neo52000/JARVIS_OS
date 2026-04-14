from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.modules.auth.models import User
from app.modules.tasks.schemas import (
    StatusUpdate,
    TaskCreate,
    TaskResponse,
    TaskUpdate,
)
from app.modules.tasks.service import (
    create_task,
    delete_task,
    get_task,
    get_tasks,
    update_task,
)

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    status: str | None = Query(None),
    priority: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_tasks(
        db, current_user.id, task_status=status, priority=priority, skip=skip, limit=limit
    )


@router.post("", response_model=TaskResponse, status_code=201)
def create(
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_task(db, current_user.id, data)


@router.get("/{task_id}", response_model=TaskResponse)
def read(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_task(db, task_id, current_user.id)


@router.put("/{task_id}", response_model=TaskResponse)
def update(
    task_id: str,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_task(db, task_id, current_user.id, data)


@router.patch("/{task_id}/status", response_model=TaskResponse)
def update_status(
    task_id: str,
    data: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_task(db, task_id, current_user.id, TaskUpdate(status=data.status))


@router.delete("/{task_id}", status_code=204)
def delete(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_task(db, task_id, current_user.id)
