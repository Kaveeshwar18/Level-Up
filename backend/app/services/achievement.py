from datetime import datetime, timezone
from app.repositories.mongodb import achievement_repository

class AchievementService:
    async def check_and_trigger_achievement(self, user_id: str, badge: str) -> bool:
        # Check if already earned
        existing = await achievement_repository.find_one({"userId": user_id, "badge": badge})
        if existing:
            return False
        
        # Create achievement
        await achievement_repository.create({
            "userId": user_id,
            "badge": badge,
            "earnedAt": datetime.now(timezone.utc)
        })
        return True

    async def get_user_achievements(self, user_id: str) -> list:
        return await achievement_repository.find_all({"userId": user_id})

achievement_service = AchievementService()
