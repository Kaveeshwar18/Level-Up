from fastapi import APIRouter, Depends, status, Query
from typing import List
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.services.expense import expense_service
from app.routers.dependencies import get_current_user

router = APIRouter(prefix="/expenses", tags=["expenses"])

@router.get("", response_model=List[ExpenseResponse])
async def get_expenses(current_user: dict = Depends(get_current_user)):
    return await expense_service.get_expenses(current_user["id"])

@router.get("/stats")
async def get_stats(
    budget: float = Query(1500.0, ge=0.0),
    current_user: dict = Depends(get_current_user)
):
    return await expense_service.get_spending_stats(current_user["id"], budget)

@router.get("/{id}", response_model=ExpenseResponse)
async def get_expense(id: str, current_user: dict = Depends(get_current_user)):
    return await expense_service.get_expense_by_id(current_user["id"], id)

@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(schema: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    return await expense_service.create_expense(current_user["id"], schema)

@router.put("/{id}", response_model=ExpenseResponse)
async def update_expense(id: str, schema: ExpenseUpdate, current_user: dict = Depends(get_current_user)):
    return await expense_service.update_expense(current_user["id"], id, schema)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(id: str, current_user: dict = Depends(get_current_user)):
    await expense_service.delete_expense(current_user["id"], id)
    return None
