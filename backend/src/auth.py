from jose import JWTError, jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from key import SECRET_KEY
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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/users/login')

def create_token(data: dict):
    payload = data.copy()
    expire = datetime.now(timezone.utc)+timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    payload.update({"exp":expire})
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

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