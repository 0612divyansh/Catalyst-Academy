from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..services import auth_service

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/mark", response_model=schemas.AttendanceOut)
def mark_attendance(
    record: schemas.AttendanceMark,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_service.require_role(["teacher", "admin"]))
):
    # Check if record already exists for student + date
    existing = db.query(models.Attendance).filter(
        models.Attendance.student_id == record.student_id,
        models.Attendance.date == record.date
    ).first()

    if existing:
        existing.status = record.status
        existing.marked_by = current_user.name
        db.commit()
        db.refresh(existing)
        return existing

    attendance = models.Attendance(
        student_id=record.student_id,
        batch_id=record.batch_id,
        date=record.date,
        status=record.status,
        marked_by=current_user.name
    )
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance

@router.get("/student/{student_id}", response_model=List[schemas.AttendanceOut])
def get_student_attendance(student_id: int, db: Session = Depends(get_db)):
    return db.query(models.Attendance).filter(models.Attendance.student_id == student_id).all()

@router.get("/batch/{batch_id}", response_model=List[schemas.AttendanceOut])
def get_batch_attendance(batch_id: int, date: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Attendance).filter(models.Attendance.batch_id == batch_id)
    if date:
        query = query.filter(models.Attendance.date == date)
    return query.all()
