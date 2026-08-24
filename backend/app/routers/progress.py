from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import models
from ..schemas import schemas

router = APIRouter(prefix="/progress", tags=["Progress Analytics"])

@router.get("/student/{student_id}", response_model=schemas.ProgressOut)
def get_student_progress(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    user_name = student.user.name if student.user else "Student"

    # Attendance calculation
    attendances = db.query(models.Attendance).filter(models.Attendance.student_id == student_id).all()
    total_days = len(attendances)
    present_days = sum(1 for a in attendances if a.status in ["present", "late"])
    attendance_pct = round((present_days / total_days * 100), 1) if total_days > 0 else 100.0

    # Quiz calculation
    results = db.query(models.QuizResult).filter(models.QuizResult.student_id == student_id).all()
    quizzes_taken = len(results)
    if quizzes_taken > 0:
        avg_score = round(sum(r.score / r.max_score * 100 for r in results) / quizzes_taken, 1)
    else:
        avg_score = 0.0

    # Homework calculation
    submissions = db.query(models.HomeworkSubmission).filter(models.HomeworkSubmission.student_id == student_id).all()
    hw_completed = len(submissions)

    # Weighted Overall Progress
    overall = round((attendance_pct * 0.4) + (avg_score * 0.4) + (min(hw_completed * 20, 100) * 0.2), 1)

    return schemas.ProgressOut(
        student_id=student.id,
        student_name=user_name,
        attendance_percentage=attendance_pct,
        quizzes_taken=quizzes_taken,
        quiz_average_score=avg_score,
        homeworks_completed=hw_completed,
        overall_progress_percentage=overall
    )
