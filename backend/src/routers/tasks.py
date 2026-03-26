from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from typing import List
import models,schemas,auth
from database import get_db

router = APIRouter(prefix='/tasks', tags=["tasks"])

@router.post("/", response_model=schemas.TaskOut)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)):
    
    new_task = models.Task(
        title       = task.title,
        description = task.description,
        status      = task.status,
        owner_id    = current_user.id
    )
    
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.get("/", response_model=List[schemas.TaskOut])
def get_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
   
    return db.query(models.Task).filter(
        models.Task.owner_id == current_user.id).all()


@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task( task_id: int, updates: schemas.TaskUpdate, db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)):
    
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == current_user.id).first()
   
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for key, value in updates.model_dump(exclude_unset=True).items():
        setattr(task, key, value) 
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == current_user.id).first()
   
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}