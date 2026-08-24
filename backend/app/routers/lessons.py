from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas

router = APIRouter(prefix="/lessons", tags=["Lessons"])

@router.get("/course/{course_id}", response_model=List[schemas.LessonOut])
def get_lessons_for_course(course_id: int, db: Session = Depends(get_db)):
    return db.query(models.Lesson).filter(models.Lesson.course_id == course_id).order_by(models.Lesson.order_index).all()
