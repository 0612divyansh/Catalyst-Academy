from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..services import auth_service

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/", response_model=List[schemas.StudentOut])
def get_all_students(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_service.get_current_user)
):
    return db.query(models.Student).all()

@router.get("/me", response_model=schemas.StudentOut)
def get_my_student_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_service.get_current_user)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student

@router.get("/{student_id}", response_model=schemas.StudentOut)
def get_student_by_id(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_service.get_current_user)
):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student
