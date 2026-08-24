import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False) # 'student', 'teacher', 'parent', 'admin'
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    student_profile = relationship("Student", back_populates="user", uselist=False)
    teacher_profile = relationship("Teacher", back_populates="user", uselist=False)
    parent_profile = relationship("Parent", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    roll_number = Column(String, unique=True, index=True, nullable=False)
    grade = Column(String, nullable=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=True)
    parent_id = Column(Integer, ForeignKey("parents.id"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    batch = relationship("Batch", back_populates="students")
    parent = relationship("Parent", back_populates="children")
    quiz_results = relationship("QuizResult", back_populates="student")
    attendances = relationship("Attendance", back_populates="student")
    submissions = relationship("HomeworkSubmission", back_populates="student")


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    department = Column(String, nullable=False)
    specialization = Column(String, nullable=True)

    user = relationship("User", back_populates="teacher_profile")
    courses = relationship("Course", back_populates="teacher")


class Parent(Base):
    __tablename__ = "parents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="parent_profile")
    children = relationship("Student", back_populates="parent")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)

    teacher = relationship("Teacher", back_populates="courses")
    batches = relationship("Batch", back_populates="course")
    lessons = relationship("Lesson", back_populates="course")
    quizzes = relationship("Quiz", back_populates="course")
    homeworks = relationship("Homework", back_populates="course")


class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    schedule = Column(String, nullable=True)

    course = relationship("Course", back_populates="batches")
    students = relationship("Student", back_populates="batch")
    attendances = relationship("Attendance", back_populates="batch")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    video_url = Column(String, nullable=True)
    order_index = Column(Integer, default=1)

    course = relationship("Course", back_populates="lessons")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    total_marks = Column(Integer, default=100)
    duration_minutes = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)

    course = relationship("Course", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    results = relationship("QuizResult", back_populates="quiz")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False) # 'mcq' or 'tf'
    options_json = Column(Text, nullable=True) # JSON array string of options e.g. ["A", "B", "C", "D"]
    correct_answer = Column(String, nullable=False) # Correct option string

    quiz = relationship("Quiz", back_populates="questions")


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    answers_json = Column(Text, nullable=True)

    quiz = relationship("Quiz", back_populates="results")
    student = relationship("Student", back_populates="quiz_results")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    date = Column(String, nullable=False) # YYYY-MM-DD
    status = Column(String, nullable=False) # 'present', 'absent', 'late'
    marked_by = Column(String, nullable=True)

    student = relationship("Student", back_populates="attendances")
    batch = relationship("Batch", back_populates="attendances")


class Homework(Base):
    __tablename__ = "homework"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    due_date = Column(String, nullable=False) # YYYY-MM-DD
    created_by = Column(String, nullable=True)

    course = relationship("Course", back_populates="homeworks")
    submissions = relationship("HomeworkSubmission", back_populates="homework")


class HomeworkSubmission(Base):
    __tablename__ = "homework_submissions"

    id = Column(Integer, primary_key=True, index=True)
    homework_id = Column(Integer, ForeignKey("homework.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    submission_text = Column(Text, nullable=True)
    file_url = Column(String, nullable=True)
    status = Column(String, default="submitted") # 'submitted', 'graded'
    grade = Column(String, nullable=True)
    feedback = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

    homework = relationship("Homework", back_populates="submissions")
    student = relationship("Student", back_populates="submissions")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")
