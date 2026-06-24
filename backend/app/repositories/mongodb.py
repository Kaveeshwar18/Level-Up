from app.repositories.base import BaseRepository

class UserRepository(BaseRepository):
    def __init__(self):
        super().__init__("users")

class HabitRepository(BaseRepository):
    def __init__(self):
        super().__init__("habits")

class HabitLogRepository(BaseRepository):
    def __init__(self):
        super().__init__("habit_logs")

class GoalRepository(BaseRepository):
    def __init__(self):
        super().__init__("goals")

class ExpenseRepository(BaseRepository):
    def __init__(self):
        super().__init__("expenses")

class JournalRepository(BaseRepository):
    def __init__(self):
        super().__init__("journals")

class AchievementRepository(BaseRepository):
    def __init__(self):
        super().__init__("achievements")

user_repository = UserRepository()
habit_repository = HabitRepository()
habit_log_repository = HabitLogRepository()
goal_repository = GoalRepository()
expense_repository = ExpenseRepository()
journal_repository = JournalRepository()
achievement_repository = AchievementRepository()
