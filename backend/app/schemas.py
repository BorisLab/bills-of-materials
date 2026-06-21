from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class RoleEnum(str, Enum):
    admin = "admin"
    commercial = "commercial"
    ingenieur = "ingenieur"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: Optional[RoleEnum] = RoleEnum.commercial

class UserOut(BaseModel):
    id_utilisateur: int
    email: EmailStr
    role: RoleEnum

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
