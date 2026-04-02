from fastapi import APIRouter, Depends, HTTPException ,Response, Request
import models,schemas,auth,utils
from database import get_db
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from auth import ALGORITHM, get_current_user, create_token
import os 
from dotenv import load_dotenv

import httpx

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

router = APIRouter(prefix='/users', tags=["Users"])


@router.post('/auth/google')
async def google_auth(request: schemas.GoogleAuthRequest, response: Response, db: Session = Depends(get_db)):
    #1. We send the code, our ID, and our Secret to Google.
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": request.code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": "http://localhost:5173/auth/callback",
        "grant_type": "authorization_code"
    }
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        google_response = await client.post(token_url, data=data)
        token_data = google_response.json()
    
    if "access_token" not in token_data:
        raise HTTPException(status_code=400, detail="Invalid Google authentication code")
    
    google_access_token = token_data["access_token"]
    
    #2. Use Googles access token to get user info(email & name) from Google
    user_info_url = "https://www.googleapis.com/oauth2/v1/userinfo"
    headers = {"Authorization": f"Bearer {google_access_token}"}
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        user_info_response = await client.get(user_info_url, headers=headers)
        user_info = user_info_response.json()
    
    email = user_info.get("email")
    name = user_info.get("name")
    
    # Check if this Google user is already in our Task Manager database
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if not user:
        # They don't have a local password, so we hash a random impossible string.
        random_password = utils.hash_password(os.urandom(32).hex())
        user = models.User(
            name = name,
            email = email,
            password = random_password,
            role = "users"    # Default role
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    #3. We create a JWT token for them to use in our Task Manager app
    access_token = auth.create_token(data={"sub": user.email, "role": user.role})
    refresh_token = auth.create_refresh_token(data={"sub": user.email})
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,     
        samesite="lax"
    )
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post('/register', response_model= schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter( models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email Already Exists")
    
    hash_pwd = utils.hash_password(user.password)
    
    new_user = models.User(
        name = user.name,
        email = user.email,
        password = hash_pwd,
        role = user.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post('/login')
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(),db: Session = Depends(get_db)):
    email = form_data.username   
    password = form_data.password
    
    user = db.query(models.User).filter(models.User.email == email).first()

    if not user or not utils.verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = auth.create_token({'sub': user.email, 'role': user.role})
    refresh_token = auth.create_refresh_token({'sub': user.email})
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax"
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/refresh")
def refresh_token(request: Request, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        user = db.query(models.User).filter(models.User.email == email).first()
        
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
       
        new_access_token = create_token(data={"sub":user.email, "role":user.role})
        
        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
@router.get("/", response_model=list[schemas.UserOut])
def get_all_users(db: Session = Depends(get_db),current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorize to get all users")
    
    return db.query(models.User).all()

@router.delete('/{user_id}')
def delete_user(user_id: int, db: Session=Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete user")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return{"detail":"User deleted"}


            
    