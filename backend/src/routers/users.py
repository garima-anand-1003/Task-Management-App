from fastapi import APIRouter, Depends, HTTPException
import models,schemas,auth,utils
from database import get_db
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix='/users', tags=["Users"])

@router.post('/register', response_model= schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter( models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email Already Exists")
    
    hash_pwd = utils.hash_password(user.password)
    
    new_user = models.User(
        name = user.name,
        email = user.email,
        password = hash_pwd
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post('/login')
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    email = form_data.username   # ⚠️ important
    password = form_data.password

    user = db.query(models.User).filter(models.User.email == email).first()

    if not user or not utils.verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = auth.create_token({'sub': user.email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }

            
    