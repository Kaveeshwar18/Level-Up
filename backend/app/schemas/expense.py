from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ExpenseCreate(BaseModel):
    amount: float = Field(..., gt=0)
    category: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = ""
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None

class ExpenseResponse(BaseModel):
    id: str
    userId: str
    amount: float
    category: str
    description: Optional[str] = ""
    date: str
    createdAt: datetime
