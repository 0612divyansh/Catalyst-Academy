import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..services import auth_service

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])

@router.get("/", response_model=List[schemas.QuizOut])
def list_quizzes(db: Session = Depends(get_db)):
    return db.query(models.Quiz).filter(models.Quiz.is_active == True).all()

@router.get("/{quiz_id}", response_model=schemas.QuizOut)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@router.post("/", response_model=schemas.QuizOut)
def create_quiz(
    quiz_data: schemas.QuizCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_service.require_role(["teacher", "admin"]))
):
    new_quiz = models.Quiz(
        course_id=quiz_data.course_id,
        title=quiz_data.title,
        total_marks=quiz_data.total_marks,
        duration_minutes=quiz_data.duration_minutes
    )
    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)

    for q in quiz_data.questions:
        question = models.Question(
            quiz_id=new_quiz.id,
            text=q.text,
            question_type=q.question_type,
            options_json=json.dumps(q.options),
            correct_answer=q.correct_answer
        )
        db.add(question)

    db.commit()
    db.refresh(new_quiz)
    return new_quiz

@router.put("/{quiz_id}", response_model=schemas.QuizOut)
def update_quiz(
    quiz_id: int,
    quiz_data: schemas.QuizUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_service.require_role(["teacher", "admin"]))
):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    if quiz_data.title is not None:
        quiz.title = quiz_data.title
    if quiz_data.course_id is not None:
        quiz.course_id = quiz_data.course_id
    if quiz_data.total_marks is not None:
        quiz.total_marks = quiz_data.total_marks
    if quiz_data.duration_minutes is not None:
        quiz.duration_minutes = quiz_data.duration_minutes
    if quiz_data.is_active is not None:
        quiz.is_active = quiz_data.is_active

    if quiz_data.questions is not None:
        db.query(models.Question).filter(models.Question.quiz_id == quiz.id).delete()
        for q in quiz_data.questions:
            question = models.Question(
                quiz_id=quiz.id,
                text=q.text,
                question_type=q.question_type,
                options_json=json.dumps(q.options),
                correct_answer=q.correct_answer
            )
            db.add(question)

    db.commit()
    db.refresh(quiz)
    return quiz

@router.delete("/{quiz_id}")
def delete_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_service.require_role(["teacher", "admin"]))
):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    db.query(models.QuizResult).filter(models.QuizResult.quiz_id == quiz.id).delete()
    db.query(models.Question).filter(models.Question.quiz_id == quiz.id).delete()
    db.delete(quiz)
    db.commit()
    return {"message": "Quiz deleted successfully", "id": quiz_id}

@router.post("/submit", response_model=schemas.QuizResultOut)
def submit_quiz(
    submission: schemas.QuizSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_service.get_current_user)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        # Fallback to first student if admin/teacher testing
        student = db.query(models.Student).first()
        if not student:
            raise HTTPException(status_code=400, detail="No active student record for quiz submission")

    quiz = db.query(models.Quiz).filter(models.Quiz.id == submission.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = db.query(models.Question).filter(models.Question.quiz_id == quiz.id).all()
    if not questions:
        raise HTTPException(status_code=400, detail="Quiz has no questions")

    points_per_question = quiz.total_marks / len(questions)
    total_score = 0.0

    for q in questions:
        student_answer = submission.answers.get(str(q.id)) or submission.answers.get(q.id)
        if student_answer and str(student_answer).strip().lower() == str(q.correct_answer).strip().lower():
            total_score += points_per_question

    result = models.QuizResult(
        quiz_id=quiz.id,
        student_id=student.id,
        score=round(total_score, 1),
        max_score=quiz.total_marks,
        answers_json=json.dumps(submission.answers)
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result

@router.get("/results/student/{student_id}", response_model=List[schemas.QuizResultOut])
def get_student_quiz_results(student_id: int, db: Session = Depends(get_db)):
    return db.query(models.QuizResult).filter(models.QuizResult.student_id == student_id).all()
