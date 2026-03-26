from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    
    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    id: Optional[int] = None
    title: str
    description: Optional[str] = None
    status: str = "Pending"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    owner_id: int

    class Config:
        from_attributes = True



    