from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..services import auth_service

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("/", response_model=List[schemas.CourseOut])
def get_all_courses(db: Session = Depends(get_db)):
    return db.query(models.Course).all()

@router.post("/", response_model=schemas.CourseOut)
def create_course(
    course: schemas.CourseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_service.require_role(["teacher", "admin"]))
):
    new_course = models.Course(
        title=course.title,
        code=course.code,
        description=course.description,
        teacher_id=course.teacher_id
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

@router.get("/{course_id}", response_model=schemas.CourseOut)
def get_course_detail(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
