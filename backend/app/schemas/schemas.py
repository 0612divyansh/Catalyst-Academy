from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    name: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str # student, teacher, parent, admin
    phone: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: str
    phone: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Student Schemas
class StudentOut(BaseModel):
    id: int
    user_id: int
    roll_number: str
    grade: Optional[str] = None
    batch_id: Optional[int] = None
    parent_id: Optional[int] = None
    user: UserOut

    class Config:
        from_attributes = True

# Teacher Schemas
class TeacherOut(BaseModel):
    id: int
    user_id: int
    department: str
    specialization: Optional[str] = None
    user: UserOut

    class Config:
        from_attributes = True

# Parent Schemas
class ParentOut(BaseModel):
    id: int
    user_id: int
    user: UserOut
    children: List[StudentOut] = []

    class Config:
        from_attributes = True

# Course & Batch Schemas
class LessonOut(BaseModel):
    id: int
    course_id: int
    title: str
    content: Optional[str] = None
    video_url: Optional[str] = None
    order_index: int

    class Config:
        from_attributes = True

class BatchOut(BaseModel):
    id: int
    name: str
    course_id: int
    schedule: Optional[str] = None

    class Config:
        from_attributes = True

class CourseCreate(BaseModel):
    title: str
    code: str
    description: Optional[str] = None
    teacher_id: Optional[int] = None

class CourseOut(BaseModel):
    id: int
    title: str
    code: str
    description: Optional[str] = None
    teacher_id: Optional[int] = None
    batches: List[BatchOut] = []
    lessons: List[LessonOut] = []

    class Config:
        from_attributes = True

# Question & Quiz Schemas
class QuestionOut(BaseModel):
    id: int
    quiz_id: int
    text: str
    question_type: str
    options_json: Optional[str] = None
    # Hide correct_answer in standard student query unless grading

    class Config:
        from_attributes = True

class QuestionCreate(BaseModel):
    text: str
    question_type: str # 'mcq' or 'tf'
    options: List[str] # ["A", "B", "C", "D"]
    correct_answer: str

class QuizCreate(BaseModel):
    course_id: int
    title: str
    total_marks: int = 100
    duration_minutes: int = 30
    questions: List[QuestionCreate]

class QuizOut(BaseModel):
    id: int
    course_id: int
    title: str
    total_marks: int
    duration_minutes: int
    is_active: bool
    questions: List[QuestionOut] = []

    class Config:
        from_attributes = True

class QuizSubmit(BaseModel):
    quiz_id: int
    answers: dict # {question_id: selected_option}

class QuizResultOut(BaseModel):
    id: int
    quiz_id: int
    student_id: int
    score: float
    max_score: float
    submitted_at: datetime
    answers_json: Optional[str] = None

    class Config:
        from_attributes = True

# Attendance Schemas
class AttendanceMark(BaseModel):
    student_id: int
    batch_id: int
    date: str # YYYY-MM-DD
    status: str # 'present', 'absent', 'late'

class AttendanceOut(BaseModel):
    id: int
    student_id: int
    batch_id: int
    date: str
    status: str
    marked_by: Optional[str] = None

    class Config:
        from_attributes = True

# Homework Schemas
class HomeworkCreate(BaseModel):
    course_id: int
    title: str
    description: str
    due_date: str

class HomeworkSubmissionCreate(BaseModel):
    homework_id: int
    submission_text: Optional[str] = None
    file_url: Optional[str] = None

class HomeworkSubmissionOut(BaseModel):
    id: int
    homework_id: int
    student_id: int
    submission_text: Optional[str] = None
    file_url: Optional[str] = None
    status: str
    grade: Optional[str] = None
    feedback: Optional[str] = None
    submitted_at: datetime

    class Config:
        from_attributes = True

class HomeworkOut(BaseModel):
    id: int
    course_id: int
    title: str
    description: str
    due_date: str
    created_by: Optional[str] = None
    submissions: List[HomeworkSubmissionOut] = []

    class Config:
        from_attributes = True

# Notification Schema
class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Progress Schema
class ProgressOut(BaseModel):
    student_id: int
    student_name: str
    attendance_percentage: float
    quizzes_taken: int
    quiz_average_score: float
    homeworks_completed: int
    overall_progress_percentage: float
