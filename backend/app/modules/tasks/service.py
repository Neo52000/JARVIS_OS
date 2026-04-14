from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.tasks.models import Task
from app.modules.tasks.schemas import TaskCreate, TaskUpdate


def get_tasks(
    db: Session,
    user_id: str,
    task_status: str | None = None,
    priority: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[Task]:
    query = db.query(Task).filter(Task.user_id == user_id)
    if task_status:
        query = query.filter(Task.status == task_status)
    if priority:
        query = query.filter(Task.priority == priority)
    return query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()


def get_task(db: Session, task_id: str, user_id: str) -> Task:
    task = (
        db.query(Task)
        .filter(Task.id == task_id, Task.user_id == user_id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


def create_task(db: Session, user_id: str, data: TaskCreate) -> Task:
    task = Task(user_id=user_id, **data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task_id: str, user_id: str, data: TaskUpdate) -> Task:
    task = get_task(db, task_id, user_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: str, user_id: str) -> None:
    task = get_task(db, task_id, user_id)
    db.delete(task)
    db.commit()


def count_tasks_by_status(db: Session, user_id: str) -> dict[str, int]:
    tasks = db.query(Task).filter(Task.user_id == user_id).all()
    counts = {"todo": 0, "in_progress": 0, "done": 0}
    for task in tasks:
        counts[task.status] = counts.get(task.status, 0) + 1
    return counts
