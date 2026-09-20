from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..services import auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=schemas.UserOut)
def register_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = auth_service.get_password_hash(user_data.password)
    user = models.User(
        email=user_data.email,
        hashed_password=hashed_pw,
        name=user_data.name,
        role=user_data.role,
        phone=user_data.phone
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create associated profile based on role
    if user.role == "student":
        roll_num = f"STU-{user.id:04d}"
        student = models.Student(user_id=user.id, roll_number=roll_num)
        db.add(student)
    elif user.role == "teacher":
        teacher = models.Teacher(user_id=user.id, department="General Academics")
        db.add(teacher)
    elif user.role == "parent":
        parent = models.Parent(user_id=user.id)
        db.add(parent)
    db.commit()

    return user

import re

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    identifier = form_data.username.strip()
    norm_identifier = re.sub(r"[^\d]", "", identifier)

    # 1. Direct email match
    user = db.query(models.User).filter(models.User.email.ilike(identifier)).first()

    # 2. Direct phone match
    if not user:
        user = db.query(models.User).filter(models.User.phone == identifier).first()

    # 3. Normalized phone match (e.g. ignoring spaces, dashes, country code prefix)
    if not user and len(norm_identifier) >= 7:
        users_with_phone = db.query(models.User).filter(models.User.phone.isnot(None)).all()
        for u in users_with_phone:
            u_digits = re.sub(r"[^\d]", "", u.phone or "")
            if u_digits and (u_digits == norm_identifier or u_digits.endswith(norm_identifier) or norm_identifier.endswith(u_digits)):
                user = u
                break

    if not user or not auth_service.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email, phone number, or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth_service.create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "name": user.name
    }

@router.get("/me", response_model=schemas.UserOut)
def get_current_user_profile(current_user: models.User = Depends(auth_service.get_current_user)):
    return current_user
