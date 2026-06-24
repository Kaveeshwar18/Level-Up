from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class JournalCreate(BaseModel):
    content: str = Field(...)
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")

class JournalUpdate(BaseModel):
    content: Optional[str] = None
    date: Optional[str] = None

class JournalResponse(BaseModel):
    id: str
    userId: str
    content: str
    date: str
    createdAt: datetime
