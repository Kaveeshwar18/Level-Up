from fastapi import APIRouter, Depends, status
from typing import List
from app.schemas.habit import HabitCreate, HabitUpdate, HabitResponse, HabitLogCreate, HabitLogResponse
from app.services.habit import habit_service
from app.routers.dependencies import get_current_user

router = APIRouter(prefix="/habits", tags=["habits"])

@router.get("", response_model=List[HabitResponse])
async def get_habits(current_user: dict = Depends(get_current_user)):
    return await habit_service.get_habits_with_stats(current_user["id"])

@router.get("/{id}", response_model=HabitResponse)
async def get_habit(id: str, current_user: dict = Depends(get_current_user)):
    return await habit_service.get_habit_with_stats(current_user["id"], id)

@router.post("", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
async def create_habit(schema: HabitCreate, current_user: dict = Depends(get_current_user)):
    return await habit_service.create_habit(current_user["id"], schema)

@router.put("/{id}", response_model=HabitResponse)
async def update_habit(id: str, schema: HabitUpdate, current_user: dict = Depends(get_current_user)):
    return await habit_service.update_habit(current_user["id"], id, schema)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_habit(id: str, current_user: dict = Depends(get_current_user)):
    await habit_service.delete_habit(current_user["id"], id)
    return None

@router.post("/{id}/log", response_model=HabitResponse)
async def log_habit(id: str, schema: HabitLogCreate, current_user: dict = Depends(get_current_user)):
    return await habit_service.toggle_habit_log(current_user["id"], id, schema.date, schema.completed)

@router.get("/{id}/logs", response_model=List[HabitLogResponse])
async def get_habit_logs(id: str, current_user: dict = Depends(get_current_user)):
    return await habit_service.get_habit_logs(current_user["id"], id)
