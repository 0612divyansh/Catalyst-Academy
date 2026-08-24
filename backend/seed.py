import json
import os
import sys

# Ensure backend path is on sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models import models
from app.services import auth_service

def seed_database():
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    print("Seeding Users...")
    # Admin
    admin_user = models.User(
        email="admin@academy.edu",
        hashed_password=auth_service.get_password_hash("admin123"),
        name="Chief Admin",
        role="admin",
        phone="+1 800-555-0100"
    )
    db.add(admin_user)

    # Teachers
    t1_user = models.User(
        email="sarah@academy.edu",
        hashed_password=auth_service.get_password_hash("teacher123"),
        name="Prof. Sarah Jenkins",
        role="teacher",
        phone="+1 800-555-0201"
    )
    t2_user = models.User(
        email="mark@academy.edu",
        hashed_password=auth_service.get_password_hash("teacher123"),
        name="Dr. Mark Taylor",
        role="teacher",
        phone="+1 800-555-0202"
    )
    db.add_all([t1_user, t2_user])

    # Parent
    parent_user = models.User(
        email="robert@academy.edu",
        hashed_password=auth_service.get_password_hash("parent123"),
        name="Robert Vance (Parent)",
        role="parent",
        phone="+1 800-555-0301"
    )
    db.add(parent_user)

    # Students
    s1_user = models.User(
        email="alex@academy.edu",
        hashed_password=auth_service.get_password_hash("student123"),
        name="Alex Vance",
        role="student",
        phone="+1 800-555-0401"
    )
    s2_user = models.User(
        email="emma@academy.edu",
        hashed_password=auth_service.get_password_hash("student123"),
        name="Emma Watson",
        role="student",
        phone="+1 800-555-0402"
    )
    s3_user = models.User(
        email="liam@academy.edu",
        hashed_password=auth_service.get_password_hash("student123"),
        name="Liam Neeson",
        role="student",
        phone="+1 800-555-0403"
    )
    db.add_all([s1_user, s2_user, s3_user])
    db.commit()

    # Profiles
    print("Creating Profiles...")
    t1_profile = models.Teacher(user_id=t1_user.id, department="Computer Science", specialization="FastAPI & Backend")
    t2_profile = models.Teacher(user_id=t2_user.id, department="DevOps Engineering", specialization="Docker, CI/CD, Cloud")
    parent_profile = models.Parent(user_id=parent_user.id)
    db.add_all([t1_profile, t2_profile, parent_profile])
    db.commit()

    # Courses
    print("Creating Courses...")
    c1 = models.Course(title="FastAPI & Python Backend Architecture", code="PY201", description="Master asynchronous RESTful API development with FastAPI, SQLAlchemy, and JWT Authentication.", teacher_id=t1_profile.id)
    c2 = models.Course(title="DevOps & Cloud Automation", code="DOV301", description="Comprehensive guide to Containerization, CI/CD pipelines, Docker, and Kubernetes deployment.", teacher_id=t2_profile.id)
    c3 = models.Course(title="Flutter Mobile App Development", code="FLT101", description="Build cross-platform mobile apps for Android & iOS using Flutter, Dart, and Provider state management.", teacher_id=t1_profile.id)
    db.add_all([c1, c2, c3])
    db.commit()

    # Batches
    b1 = models.Batch(name="Catalyst Alpha Batch 2026", course_id=c1.id, schedule="Mon-Wed-Fri 10:00 AM")
    b2 = models.Batch(name="DevOps Beta Batch 2026", course_id=c2.id, schedule="Tue-Thu-Sat 02:00 PM")
    db.add_all([b1, b2])
    db.commit()

    # Student Profiles linked to Batches & Parent
    s1_profile = models.Student(user_id=s1_user.id, roll_number="STU-0001", grade="A+", batch_id=b1.id, parent_id=parent_profile.id)
    s2_profile = models.Student(user_id=s2_user.id, roll_number="STU-0002", grade="A", batch_id=b1.id)
    s3_profile = models.Student(user_id=s3_user.id, roll_number="STU-0003", grade="B+", batch_id=b2.id)
    db.add_all([s1_profile, s2_profile, s3_profile])
    db.commit()

    # Lessons
    print("Seeding Lessons...")
    lessons = [
        models.Lesson(course_id=c1.id, title="1. Introduction to FastAPI & Async I/O", content="Learn why FastAPI is one of the fastest Python frameworks using Starlette and Pydantic.", video_url="https://www.youtube.com/embed/gQtr49wXQ0o", order_index=1),
        models.Lesson(course_id=c1.id, title="2. Pydantic Models & Data Validation", content="Learn typing, input validation, and automatic API document generation.", video_url="https://www.youtube.com/embed/gQtr49wXQ0o", order_index=2),
        models.Lesson(course_id=c1.id, title="3. Database Integration with SQLAlchemy", content="Connecting FastAPI with SQLite and PostgreSQL using ORM models.", video_url="https://www.youtube.com/embed/gQtr49wXQ0o", order_index=3),
        models.Lesson(course_id=c2.id, title="1. Docker Fundamentals & Containers", content="Understanding containerization, images, volumes, and networks.", video_url="https://www.youtube.com/embed/gQtr49wXQ0o", order_index=1),
        models.Lesson(course_id=c2.id, title="2. Writing Robust Dockerfiles", content="Best practices for lightweight multi-stage Docker builds.", video_url="https://www.youtube.com/embed/gQtr49wXQ0o", order_index=2),
    ]
    db.add_all(lessons)
    db.commit()

    # Quizzes & Questions
    print("Seeding Quizzes...")
    q1 = models.Quiz(course_id=c1.id, title="Python & FastAPI Mid-Term Assessment", total_marks=100, duration_minutes=20)
    q2 = models.Quiz(course_id=c2.id, title="Docker & DevOps Mastery Test", total_marks=100, duration_minutes=15)
    db.add_all([q1, q2])
    db.commit()

    q1_questions = [
        models.Question(quiz_id=q1.id, text="What library does FastAPI use for data validation and parsing?", question_type="mcq", options_json=json.dumps(["Django ORM", "Pydantic", "Marshmallow", "Cerberus"]), correct_answer="Pydantic"),
        models.Question(quiz_id=q1.id, text="FastAPI natively supports asynchronous endpoint functions with `async def`.", question_type="tf", options_json=json.dumps(["True", "False"]), correct_answer="True"),
        models.Question(quiz_id=q1.id, text="Which HTTP status code signifies an Unauthorized request?", question_type="mcq", options_json=json.dumps(["200 OK", "400 Bad Request", "401 Unauthorized", "500 Internal Error"]), correct_answer="401 Unauthorized"),
        models.Question(quiz_id=q1.id, text="SQLAlchemy requires raw SQL queries for every database operation.", question_type="tf", options_json=json.dumps(["True", "False"]), correct_answer="False"),
    ]

    q2_questions = [
        models.Question(quiz_id=q2.id, text="Which command builds a Docker image from a Dockerfile in the current directory?", question_type="mcq", options_json=json.dumps(["docker run .", "docker build -t app .", "docker exec -it app", "docker pull app"]), correct_answer="docker build -t app ."),
        models.Question(quiz_id=q2.id, text="Containers share the host operating system kernel.", question_type="tf", options_json=json.dumps(["True", "False"]), correct_answer="True"),
    ]
    db.add_all(q1_questions + q2_questions)
    db.commit()

    # Pre-calculated Quiz Result for Alex
    res1 = models.QuizResult(quiz_id=q1.id, student_id=s1_profile.id, score=100.0, max_score=100.0, answers_json=json.dumps({"1": "Pydantic", "2": "True", "3": "401 Unauthorized", "4": "False"}))
    db.add(res1)

    # Attendance Records
    print("Seeding Attendance...")
    dates = ["2026-08-01", "2026-08-03", "2026-08-05", "2026-08-08", "2026-08-10", "2026-08-12"]
    for d in dates:
        db.add(models.Attendance(student_id=s1_profile.id, batch_id=b1.id, date=d, status="present", marked_by="Prof. Sarah Jenkins"))
        db.add(models.Attendance(student_id=s2_profile.id, batch_id=b1.id, date=d, status="present" if d != "2026-08-05" else "absent", marked_by="Prof. Sarah Jenkins"))
        db.add(models.Attendance(student_id=s3_profile.id, batch_id=b2.id, date=d, status="present" if d != "2026-08-08" else "late", marked_by="Dr. Mark Taylor"))
    db.commit()

    # Homework
    print("Seeding Homework...")
    hw1 = models.Homework(course_id=c1.id, title="Build a JWT Authenticated User API", description="Implement /auth/register, /auth/login, and /auth/me endpoints using FastAPI and PyJWT.", due_date="2026-08-18", created_by="Prof. Sarah Jenkins")
    hw2 = models.Homework(course_id=c2.id, title="Write a Multi-Stage Dockerfile", description="Containerize a FastAPI app with SQLite and ensure image size is below 150MB.", due_date="2026-08-20", created_by="Dr. Mark Taylor")
    db.add_all([hw1, hw2])
    db.commit()

    # Homework Submissions
    sub1 = models.HomeworkSubmission(homework_id=hw1.id, student_id=s1_profile.id, submission_text="Completed all endpoints with full PyJWT validation and bcrypt password hashing.", file_url="https://github.com/alexvance/jwt-api-demo", status="graded", grade="A+", feedback="Outstanding implementation! Code is clean and modular.")
    db.add(sub1)
    db.commit()

    # Notifications
    n1 = models.Notification(user_id=s1_user.id, title="Quiz Graded", message="Your quiz 'Python & FastAPI Mid-Term Assessment' scored 100/100 (A+).")
    n2 = models.Notification(user_id=s1_user.id, title="New Homework Assigned", message="Homework 'Build a JWT Authenticated User API' is due on 2026-08-18.")
    n3 = models.Notification(user_id=parent_user.id, title="Child Attendance Update", message="Alex Vance was marked Present for Catalyst Alpha Batch on 2026-08-12.")
    db.add_all([n1, n2, n3])
    db.commit()

    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
