from datetime import datetime, timezone
import datetime as dt
from fastapi import HTTPException
from app.repositories.mongodb import expense_repository
from app.schemas.expense import ExpenseCreate, ExpenseUpdate

class ExpenseService:
    async def get_expenses(self, user_id: str) -> list:
        return await expense_repository.find_all({"userId": user_id}, sort=[("date", -1)])

    async def get_expense_by_id(self, user_id: str, expense_id: str) -> dict:
        expense = await expense_repository.find_one({"id": expense_id, "userId": user_id})
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")
        return expense

    async def create_expense(self, user_id: str, schema: ExpenseCreate) -> dict:
        data = schema.model_dump()
        data["userId"] = user_id
        data["createdAt"] = datetime.now(timezone.utc)
        return await expense_repository.create(data)

    async def update_expense(self, user_id: str, expense_id: str, schema: ExpenseUpdate) -> dict:
        expense = await expense_repository.find_one({"id": expense_id, "userId": user_id})
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")
        update_data = schema.model_dump(exclude_unset=True)
        return await expense_repository.update(expense_id, update_data)

    async def delete_expense(self, user_id: str, expense_id: str) -> bool:
        expense = await expense_repository.find_one({"id": expense_id, "userId": user_id})
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")
        return await expense_repository.delete(expense_id)

    async def get_spending_stats(self, user_id: str, budget: float = 1500.0) -> dict:
        expenses = await expense_repository.find_all({"userId": user_id})
        
        today_str = dt.date.today().strftime("%Y-%m-%d")
        current_month_prefix = dt.date.today().strftime("%Y-%m")
        
        today_spending = 0.0
        monthly_spending = 0.0
        category_totals = {}
        
        for exp in expenses:
            amount = exp.get("amount", 0.0)
            date = exp.get("date", "")
            cat = exp.get("category", "Other")
            
            if date == today_str:
                today_spending += amount
            if date.startswith(current_month_prefix):
                monthly_spending += amount
                category_totals[cat] = category_totals.get(cat, 0.0) + amount
                
        return {
            "todaySpending": round(today_spending, 2),
            "monthlySpending": round(monthly_spending, 2),
            "monthlyBudget": budget,
            "budgetRemaining": round(max(0.0, budget - monthly_spending), 2),
            "categoryBreakdown": [{ "name": k, "value": round(v, 2) } for k, v in category_totals.items()]
        }

expense_service = ExpenseService()
