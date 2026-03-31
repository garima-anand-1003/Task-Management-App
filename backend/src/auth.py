from jose import JWTError, jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from database import get_db, SessionLocal
from sqlalchemy.orm import Session

import models
from datetime import datetime, timedelta,timezone

import os 
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/users/login')

def create_token(data: dict):
    payload = data.copy()
    expire = datetime.now(timezone.utc)+timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    payload.update({"exp":expire})
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    payload = data.copy()
    expire = datetime.now(timezone.utc)+timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload.update({"exp": expire})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get('sub')
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expired or invalid")


    user = db.query(models.User).filter( models.User.email == email  ).first()
    if not user:
        raise HTTPException(
                status_code=401,
                detail="User not found"
            )
   
    return user

def require_role(required_role: str):
    def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker