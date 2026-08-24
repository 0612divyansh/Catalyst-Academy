import jwt
import datetime
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import models
from passlib.context import CryptContext

SECRET_KEY = "CATALYST_ACADEMY_SECRET_KEY_SUPER_SECURE_LMS_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

import bcrypt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        if isinstance(plain_password, str):
            plain_bytes = plain_password.encode('utf-8')
        else:
            plain_bytes = plain_password
            
        if isinstance(hashed_password, str):
            hash_bytes = hashed_password.encode('utf-8')
        else:
            hash_bytes = hashed_password
            
        return bcrypt.checkpw(plain_bytes, hash_bytes)
    except Exception:
        return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    if isinstance(password, str):
        pwd_bytes = password.encode('utf-8')
    else:
        pwd_bytes = password
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def require_role(roles: list):
    def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role not in roles and "admin" not in current_user.role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden for role: {current_user.role}"
            )
        return current_user
    return role_checker
