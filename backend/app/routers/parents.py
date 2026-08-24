from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..services import auth_service

router = APIRouter(prefix="/parents", tags=["Parents"])

@router.get("/me", response_model=schemas.ParentOut)
def get_parent_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_service.get_current_user)
):
    parent = db.query(models.Parent).filter(models.Parent.user_id == current_user.id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent profile not found")
    return parent

@router.get("/children", response_model=List[schemas.StudentOut])
def get_parent_children(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_service.get_current_user)
):
    parent = db.query(models.Parent).filter(models.Parent.user_id == current_user.id).first()
    if not parent:
        # Fallback to returning all students if user is admin testing
        if current_user.role == "admin":
            return db.query(models.Student).all()
        return []
    return parent.children
