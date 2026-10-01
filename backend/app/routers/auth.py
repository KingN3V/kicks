from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

from app.config import ADMIN_USERNAME
from app.security import authenticate_admin, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

# Tells FastAPI where tokens come from, and adds the "Authorize" button in /docs
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=Token)
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()]):
    if not authenticate_admin(form.username, form.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return Token(access_token=create_access_token(form.username))


def get_current_admin(token: Annotated[str, Depends(oauth2_scheme)]) -> str:
    """The guard: add this as a dependency to any route only the admin may use."""
    username = decode_access_token(token)
    if username is None or username != ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return username


@router.get("/me")
def me(admin: Annotated[str, Depends(get_current_admin)]):
    return {"username": admin}