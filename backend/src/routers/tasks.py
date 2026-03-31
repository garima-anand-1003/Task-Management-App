from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from typing import List
import models,schemas,auth
from database import get_db

router = APIRouter(prefix='/tasks', tags=["Tasks"])

@router.post("/", response_model=schemas.TaskOut)
def create_task( task: schemas.TaskCreate, db: Session = Depends(get_db),current_user: models.User = Depends(auth.get_current_user)):
    
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
    if current_user.role == "admin":
        return db.query(models.Task).all()
   
    return db.query(models.Task).filter( models.Task.owner_id == current_user.id).all()


@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task( task_id: int, updates: schemas.TaskUpdate, db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)):
    
    # 1. Save the query to a variable
    task_query = db.query(models.Task).filter(models.Task.id == task_id)
    # 2. Get the instance to check if it exists and verify ownership
    task = task_query.first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if current_user.role != "admin" and current_user.id != task.owner_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this task")
    
    update_data = updates.model_dump(exclude_unset=True)
    task_query.update(update_data, synchronize_session=False)
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    
    task = db.query(models.Task).filter(  models.Task.id == task_id).first()
   
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if current_user.role != "admin" and current_user.id != task.owner_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this task")
    
    
    db.delete(task) 
    db.commit()
    return {"details": "Task deleted"}