from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class HabitCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = ""
    category: str = Field(..., description="Health, Fitness, Study, Finance, Productivity, Custom")
    goalDays: int = Field(21, ge=1, le=365)
    icon: Optional[str] = "🔥"
    color: Optional[str] = "#7C3AED"

class HabitUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    goalDays: Optional[int] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class HabitResponse(BaseModel):
    id: str
    userId: str
    title: str
    description: Optional[str] = ""
    category: str
    goalDays: int
    icon: str
    color: str
    createdAt: datetime
    currentStreak: int = 0
    maxStreak: int = 0
    completionRate: float = 0.0  # Percentage
    isCompletedToday: bool = False

class HabitLogCreate(BaseModel):
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    completed: bool = True

class HabitLogResponse(BaseModel):
    id: str
    habitId: str
    userId: str
    date: str
    completed: bool
