from datetime import datetime, timezone
from fastapi import HTTPException
from app.repositories.mongodb import goal_repository
from app.schemas.goal import GoalCreate, GoalUpdate

class GoalService:
    def _calculate_progress(self, goal: dict) -> dict:
        curr = goal.get("currentValue", 0.0)
        target = goal.get("targetValue", 1.0)
        if target <= 0.0:
            target = 1.0
        pct = round((curr / target) * 100, 1)
        if pct > 100.0:
            pct = 100.0
        goal["progressPercentage"] = pct
        return goal

    async def get_goals(self, user_id: str) -> list:
        goals = await goal_repository.find_all({"userId": user_id})
        return [self._calculate_progress(g) for g in goals]

    async def get_goal_by_id(self, user_id: str, goal_id: str) -> dict:
        goal = await goal_repository.find_one({"id": goal_id, "userId": user_id})
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        return self._calculate_progress(goal)

    async def create_goal(self, user_id: str, schema: GoalCreate) -> dict:
        data = schema.model_dump()
        data["userId"] = user_id
        data["createdAt"] = datetime.now(timezone.utc)
        
        created = await goal_repository.create(data)
        created = self._calculate_progress(created)
        
        if created["progressPercentage"] >= 100.0:
            from app.services.achievement import achievement_service
            await achievement_service.check_and_trigger_achievement(user_id, "goal_crusher")
            
        return created

    async def update_goal(self, user_id: str, goal_id: str, schema: GoalUpdate) -> dict:
        goal = await goal_repository.find_one({"id": goal_id, "userId": user_id})
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
            
        update_data = schema.model_dump(exclude_unset=True)
        updated = await goal_repository.update(goal_id, update_data)
        updated = self._calculate_progress(updated)
        
        if updated["progressPercentage"] >= 100.0:
            from app.services.achievement import achievement_service
            await achievement_service.check_and_trigger_achievement(user_id, "goal_crusher")
            
        return updated

    async def delete_goal(self, user_id: str, goal_id: str) -> bool:
        goal = await goal_repository.find_one({"id": goal_id, "userId": user_id})
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        return await goal_repository.delete(goal_id)

goal_service = GoalService()
