import os
import shutil
import random
import string
from datetime import timedelta
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from dotenv import load_dotenv

from database import engine, get_db, Base
from models import Participant, Department, YearOfStudy
from schemas import (
    ParticipantCreate, ParticipantUpdate, ParticipantResponse,
    Token, LoginRequest, DepartmentEnum, YearOfStudyEnum
)
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
)

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PERSOFEST'26 API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "/app/backend/uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files for uploads
app.mount("/api/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# Helper function to generate unique referral code
def generate_referral_code(db: Session) -> str:
    """Generate a unique 5-character referral code."""
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
        existing = db.query(Participant).filter(Participant.referral_code == code).first()
        if not existing:
            return code


# Helper function to convert enum to string
def participant_to_response(participant: Participant) -> dict:
    return {
        "id": participant.id,
        "name": participant.name,
        "register_number": participant.register_number,
        "email": participant.email,
        "phone_number": participant.phone_number,
        "department": participant.department.value if participant.department else None,
        "year_of_study": participant.year_of_study.value if participant.year_of_study else None,
        "profile_picture": participant.profile_picture,
        "referral_code": participant.referral_code,
        "referral_count": participant.referral_count,
        "created_at": participant.created_at
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "PERSOFEST'26 API is running"}


@app.get("/api/departments")
def get_departments():
    return [{"value": d.name, "label": d.value} for d in DepartmentEnum]


@app.get("/api/years")
def get_years():
    return [{"value": y.name, "label": y.value} for y in YearOfStudyEnum]


@app.post("/api/auth/register", response_model=ParticipantResponse)
def register_participant(participant: ParticipantCreate, db: Session = Depends(get_db)):
    # Check if register number or email already exists
    existing = db.query(Participant).filter(
        (Participant.register_number == participant.register_number) |
        (Participant.email == participant.email)
    ).first()
    
    if existing:
        if existing.register_number == participant.register_number:
            raise HTTPException(status_code=400, detail="Register number already registered")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate referral code if provided
    referrer = None
    if participant.referral_code:
        referrer = db.query(Participant).filter(
            Participant.referral_code == participant.referral_code.upper()
        ).first()
        if not referrer:
            raise HTTPException(status_code=400, detail="Invalid referral code")
    
    # Map string enum to SQLAlchemy enum
    dept_mapping = {e.value: e for e in Department}
    year_mapping = {e.value: e for e in YearOfStudy}
    
    # Generate unique referral code for new participant
    new_referral_code = generate_referral_code(db)
    
    db_participant = Participant(
        name=participant.name,
        register_number=participant.register_number,
        email=participant.email,
        phone_number=participant.phone_number,
        department=dept_mapping[participant.department.value],
        year_of_study=year_mapping[participant.year_of_study.value],
        password_hash=get_password_hash(participant.password),
        referral_code=new_referral_code,
        referred_by=participant.referral_code.upper() if participant.referral_code else None,
        referral_count=0
    )
    
    try:
        db.add(db_participant)
        
        # Increment referrer's count if referral code was used
        if referrer:
            referrer.referral_count += 1
        
        db.commit()
        db.refresh(db_participant)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Registration failed - duplicate entry")
    
    return participant_to_response(db_participant)


@app.post("/api/auth/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Participant).filter(
        Participant.register_number == login_data.register_number.upper()
    ).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid register number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.register_number}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/profile/me", response_model=ParticipantResponse)
def get_my_profile(current_user: Participant = Depends(get_current_user)):
    return participant_to_response(current_user)


@app.get("/api/profile/{register_number}", response_model=ParticipantResponse)
def get_profile_by_register_number(
    register_number: str,
    db: Session = Depends(get_db),
    current_user: Participant = Depends(get_current_user)
):
    participant = db.query(Participant).filter(
        Participant.register_number == register_number.upper()
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    return participant_to_response(participant)


@app.patch("/api/profile/me", response_model=ParticipantResponse)
def update_my_profile(
    update_data: ParticipantUpdate,
    db: Session = Depends(get_db),
    current_user: Participant = Depends(get_current_user)
):
    if update_data.email:
        existing = db.query(Participant).filter(
            Participant.email == update_data.email,
            Participant.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = update_data.email
    
    if update_data.phone_number:
        current_user.phone_number = update_data.phone_number
    
    if update_data.profile_picture is not None:
        current_user.profile_picture = update_data.profile_picture
    
    db.commit()
    db.refresh(current_user)
    return participant_to_response(current_user)


@app.post("/api/upload/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: Participant = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.")
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{current_user.register_number}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update user profile
    profile_url = f"/api/uploads/{filename}"
    current_user.profile_picture = profile_url
    db.commit()
    
    return {"profile_picture": profile_url, "message": "Profile picture uploaded successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
