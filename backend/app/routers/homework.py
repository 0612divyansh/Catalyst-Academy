from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..services import auth_service

router = APIRouter(prefix="/homework", tags=["Homework"])

@router.get("/", response_model=List[schemas.HomeworkOut])
def list_homework(db: Session = Depends(get_db)):
    return db.query(models.Homework).all()

@router.post("/", response_model=schemas.HomeworkOut)
def create_homework(
    data: schemas.HomeworkCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_service.require_role(["teacher", "admin"]))
):
    hw = models.Homework(
        course_id=data.course_id,
        title=data.title,
        description=data.description,
        due_date=data.due_date,
        created_by=current_user.name
    )
    db.add(hw)
    db.commit()
    db.refresh(hw)
    return hw

@router.post("/submit", response_model=schemas.HomeworkSubmissionOut)
def submit_homework(
    data: schemas.HomeworkSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_service.get_current_user)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        student = db.query(models.Student).first()

    existing = db.query(models.HomeworkSubmission).filter(
        models.HomeworkSubmission.homework_id == data.homework_id,
        models.HomeworkSubmission.student_id == student.id
    ).first()

    if existing:
        existing.submission_text = data.submission_text
        existing.file_url = data.file_url
        existing.status = "submitted"
        db.commit()
        db.refresh(existing)
        return existing

    sub = models.HomeworkSubmission(
        homework_id=data.homework_id,
        student_id=student.id,
        submission_text=data.submission_text,
        file_url=data.file_url,
        status="submitted"
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

@router.post("/grade/{submission_id}", response_model=schemas.HomeworkSubmissionOut)
def grade_submission(
    submission_id: int,
    grade: str,
    feedback: str = "",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_service.require_role(["teacher", "admin"]))
):
    sub = db.query(models.HomeworkSubmission).filter(models.HomeworkSubmission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    sub.grade = grade
    sub.feedback = feedback
    sub.status = "graded"
    db.commit()
    db.refresh(sub)
    return sub
