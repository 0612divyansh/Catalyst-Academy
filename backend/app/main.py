import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .database import engine, Base
from .routers import (
    auth, students, teachers, parents, courses,
    lessons, quizzes, attendance, homework, progress
)

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Academy LMS API",
    description="Catalyst Internship DevOps - Mobile-First Academy Learning Management System API",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(teachers.router)
app.include_router(parents.router)
app.include_router(courses.router)
app.include_router(lessons.router)
app.include_router(quizzes.router)
app.include_router(attendance.router)
app.include_router(homework.router)
app.include_router(progress.router)

# Mount Static Files for Frontend UI
STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "static"))
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def read_root():
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Academy LMS API is active. Access docs at /docs"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Academy LMS API"}
