from fastapi import APIRouter, Depends, status
from typing import List
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse
from app.services.goal import goal_service
from app.routers.dependencies import get_current_user

router = APIRouter(prefix="/goals", tags=["goals"])

@router.get("", response_model=List[GoalResponse])
async def get_goals(current_user: dict = Depends(get_current_user)):
    return await goal_service.get_goals(current_user["id"])

@router.get("/{id}", response_model=GoalResponse)
async def get_goal(id: str, current_user: dict = Depends(get_current_user)):
    return await goal_service.get_goal_by_id(current_user["id"], id)

@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(schema: GoalCreate, current_user: dict = Depends(get_current_user)):
    return await goal_service.create_goal(current_user["id"], schema)

@router.put("/{id}", response_model=GoalResponse)
async def update_goal(id: str, schema: GoalUpdate, current_user: dict = Depends(get_current_user)):
    return await goal_service.update_goal(current_user["id"], id, schema)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(id: str, current_user: dict = Depends(get_current_user)):
    await goal_service.delete_goal(current_user["id"], id)
    return None
