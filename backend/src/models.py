from database import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, Boolean, String,ForeignKey

class User(Base):
    __tablename__ ="users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=False)
    role = Column(String, default="user")
    
    tasks= relationship("Task", back_populates="owner")

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    
    status = Column(String, default="Pending")
    
    #Foreign Key
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tasks")