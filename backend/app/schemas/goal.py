from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class GoalCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = ""
    currentValue: float = Field(0.0, ge=0)
    targetValue: float = Field(..., ge=0)
    deadline: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    currentValue: Optional[float] = None
    targetValue: Optional[float] = None
    deadline: Optional[str] = None

class GoalResponse(BaseModel):
    id: str
    userId: str
    title: str
    description: Optional[str] = ""
    currentValue: float
    targetValue: float
    deadline: str
    createdAt: datetime
    progressPercentage: float = 0.0
