import datetime
from fastapi import HTTPException
from app.repositories.mongodb import habit_repository, habit_log_repository
from app.schemas.habit import HabitCreate, HabitUpdate

class HabitService:
    def _calculate_streaks_and_stats(self, habit: dict, logs: list) -> dict:
        # Filter logs where completed is True
        completed_dates = sorted(
            [datetime.datetime.strptime(log["date"], "%Y-%m-%d").date() for log in logs if log.get("completed", True)]
        )
        
        if not completed_dates:
            return {
                "currentStreak": 0,
                "maxStreak": 0,
                "completionRate": 0.0,
                "isCompletedToday": False
            }
            
        # Get today's date in local/server time
        today = datetime.date.today()
        yesterday = today - datetime.timedelta(days=1)
        
        # Check if completed today
        is_completed_today = today in completed_dates
        
        # Calculate current streak
        current_streak = 0
        if today in completed_dates:
            current_streak = 1
            check_date = today - datetime.timedelta(days=1)
            while check_date in completed_dates:
                current_streak += 1
                check_date -= datetime.timedelta(days=1)
        elif yesterday in completed_dates:
            current_streak = 1
            check_date = yesterday - datetime.timedelta(days=1)
            while check_date in completed_dates:
                current_streak += 1
                check_date -= datetime.timedelta(days=1)
        else:
            current_streak = 0
            
        # Calculate max streak
        max_streak = 0
        temp_streak = 0
        prev_date = None
        for d in completed_dates:
            if prev_date is None:
                temp_streak = 1
            elif (d - prev_date).days == 1:
                temp_streak += 1
            elif (d - prev_date).days > 1:
                if temp_streak > max_streak:
                    max_streak = temp_streak
                temp_streak = 1
            prev_date = d
        if temp_streak > max_streak:
            max_streak = temp_streak
            
        # Calculate completion rate
        created_date = habit.get("createdAt")
        if isinstance(created_date, str):
            try:
                created_date = datetime.datetime.fromisoformat(created_date.replace("Z", "+00:00")).date()
            except Exception:
                created_date = completed_dates[0]
        elif isinstance(created_date, datetime.datetime):
            created_date = created_date.date()
        else:
            created_date = completed_dates[0]
            
        days_active = (today - created_date).days + 1
        if days_active <= 0:
            days_active = 1
            
        completion_rate = round((len(completed_dates) / days_active) * 100, 1)
        if completion_rate > 100.0:
            completion_rate = 100.0
            
        return {
            "currentStreak": current_streak,
            "maxStreak": max_streak,
            "completionRate": completion_rate,
            "isCompletedToday": is_completed_today
        }

    async def get_habits_with_stats(self, user_id: str) -> list:
        habits = await habit_repository.find_all({"userId": user_id})
        result_habits = []
        for h in habits:
            logs = await habit_log_repository.find_all({"habitId": h["id"]})
            stats = self._calculate_streaks_and_stats(h, logs)
            h.update(stats)
            result_habits.append(h)
        return result_habits

    async def get_habit_with_stats(self, user_id: str, habit_id: str) -> dict:
        habit = await habit_repository.find_one({"id": habit_id, "userId": user_id})
        if not habit:
            raise HTTPException(status_code=404, detail="Habit not found")
        logs = await habit_log_repository.find_all({"habitId": habit_id})
        stats = self._calculate_streaks_and_stats(habit, logs)
        habit.update(stats)
        return habit

    async def create_habit(self, user_id: str, schema: HabitCreate) -> dict:
        data = schema.model_dump()
        data["userId"] = user_id
        data["createdAt"] = datetime.datetime.now(datetime.timezone.utc)
        created = await habit_repository.create(data)
        
        # Check for "first_habit" achievement
        from app.services.achievement import achievement_service
        await achievement_service.check_and_trigger_achievement(user_id, "first_habit")
        
        created.update({
            "currentStreak": 0,
            "maxStreak": 0,
            "completionRate": 0.0,
            "isCompletedToday": False
        })
        return created

    async def update_habit(self, user_id: str, habit_id: str, schema: HabitUpdate) -> dict:
        # Verify habit belongs to user
        habit = await habit_repository.find_one({"id": habit_id, "userId": user_id})
        if not habit:
            raise HTTPException(status_code=404, detail="Habit not found")
        
        update_data = schema.model_dump(exclude_unset=True)
        updated = await habit_repository.update(habit_id, update_data)
        
        logs = await habit_log_repository.find_all({"habitId": habit_id})
        stats = self._calculate_streaks_and_stats(updated, logs)
        updated.update(stats)
        return updated

    async def delete_habit(self, user_id: str, habit_id: str) -> bool:
        habit = await habit_repository.find_one({"id": habit_id, "userId": user_id})
        if not habit:
            raise HTTPException(status_code=404, detail="Habit not found")
        
        await habit_repository.delete(habit_id)
        
        # Delete related logs
        logs = await habit_log_repository.find_all({"habitId": habit_id})
        for log in logs:
            await habit_log_repository.delete(log["id"])
        return True

    async def toggle_habit_log(self, user_id: str, habit_id: str, date_str: str, completed: bool) -> dict:
        habit = await habit_repository.find_one({"id": habit_id, "userId": user_id})
        if not habit:
            raise HTTPException(status_code=404, detail="Habit not found")
        
        # Find if log exists
        log = await habit_log_repository.find_one({"habitId": habit_id, "date": date_str})
        if log:
            if completed:
                await habit_log_repository.update(log["id"], {"completed": True})
            else:
                await habit_log_repository.delete(log["id"])
        else:
            if completed:
                await habit_log_repository.create({
                    "habitId": habit_id,
                    "userId": user_id,
                    "date": date_str,
                    "completed": True
                })
        
        # Re-fetch stats and check achievements
        updated_habit = await self.get_habit_with_stats(user_id, habit_id)
        
        # Check streak achievements
        from app.services.achievement import achievement_service
        if updated_habit["currentStreak"] >= 7:
            await achievement_service.check_and_trigger_achievement(user_id, "streak_7")
        if updated_habit["currentStreak"] >= 30:
            await achievement_service.check_and_trigger_achievement(user_id, "streak_30")
        if updated_habit["currentStreak"] >= 100:
            await achievement_service.check_and_trigger_achievement(user_id, "consistency_king")
            
        return updated_habit

    async def get_habit_logs(self, user_id: str, habit_id: str) -> list:
        # Verify habit belongs to user
        habit = await habit_repository.find_one({"id": habit_id, "userId": user_id})
        if not habit:
            raise HTTPException(status_code=404, detail="Habit not found")
        return await habit_log_repository.find_all({"habitId": habit_id})

    async def get_all_user_logs(self, user_id: str) -> list:
        return await habit_log_repository.find_all({"userId": user_id})

habit_service = HabitService()
