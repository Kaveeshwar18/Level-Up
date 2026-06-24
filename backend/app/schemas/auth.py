from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, model_validator

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirmPassword: str = Field(..., min_length=6)

    @model_validator(mode="after")
    def verify_password_match(self) -> 'UserRegister':
        if self.password != self.confirmPassword:
            raise ValueError("passwords do not match")
        return self

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    avatar: Optional[str] = None
    createdAt: datetime
