import datetime
from app.services.habit import habit_service
from app.services.goal import goal_service
from app.services.expense import expense_service

class AIService:
    async def generate_insights(self, user_id: str) -> list:
        insights = []
        
        # Fetch user details
        habits = await habit_service.get_habits_with_stats(user_id)
        goals = await goal_service.get_goals(user_id)
        expense_stats = await expense_service.get_spending_stats(user_id)
        logs = await habit_service.get_all_user_logs(user_id)
        
        # 1. Analyze habits for weekend slump
        weekend_miss_count = 0
        weekend_total_count = 0
        weekday_miss_count = 0
        weekday_total_count = 0
        
        for log in logs:
            try:
                date_obj = datetime.datetime.strptime(log["date"], "%Y-%m-%d").date()
                is_weekend = date_obj.weekday() in [5, 6]  # Sat, Sun
                completed = log.get("completed", True)
                
                if is_weekend:
                    weekend_total_count += 1
                    if not completed:
                        weekend_miss_count += 1
                else:
                    weekday_total_count += 1
                    if not completed:
                        weekday_miss_count += 1
            except Exception:
                continue
                    
        weekend_miss_rate = (weekend_miss_count / weekend_total_count) if weekend_total_count > 0 else 0
        weekday_miss_rate = (weekday_miss_count / weekday_total_count) if weekday_total_count > 0 else 0
        
        if weekend_miss_rate > weekday_miss_rate and weekend_miss_rate > 0.3:
            insights.append({
                "category": "Habits",
                "type": "warning",
                "message": "Weekend Slump Detected: You are more likely to miss habits on Saturdays and Sundays. Try adjusting your goals or setting morning reminders on weekends!"
            })
            
        # 2. Check for high streaks
        high_streak_habit = None
        max_streak = 0
        for h in habits:
            curr_s = h.get("currentStreak", 0)
            if curr_s > max_streak:
                max_streak = curr_s
                high_streak_habit = h
                
        if high_streak_habit and max_streak >= 5:
            insights.append({
                "category": "Milestone",
                "type": "success",
                "message": f"Amazing Consistency! Your habit '{high_streak_habit['title']}' has an active {max_streak}-day streak. Keep the fire burning! 🔥"
            })
            
        # 3. Goal progress alerts
        near_complete_goals = [g for g in goals if 70.0 <= g.get("progressPercentage", 0.0) < 100.0]
        for g in near_complete_goals:
            insights.append({
                "category": "Goals",
                "type": "info",
                "message": f"So Close! You have completed {g['progressPercentage']}% of your goal '{g['title']}'. Just a little more effort to cross the finish line!"
            })
            
        # 4. Expense warnings
        monthly_spending = expense_stats.get("monthlySpending", 0.0)
        monthly_budget = expense_stats.get("monthlyBudget", 1500.0)
        spending_ratio = (monthly_spending / monthly_budget) if monthly_budget > 0 else 0
        
        if spending_ratio > 0.8:
            insights.append({
                "category": "Finance",
                "type": "danger",
                "message": f"Budget Warning: You have spent {round(spending_ratio * 100, 1)}% of your monthly budget. Consider putting non-essential purchases on hold."
            })
        elif 0.5 <= spending_ratio <= 0.8:
            insights.append({
                "category": "Finance",
                "type": "warning",
                "message": f"Budget Check: You have spent ${monthly_spending} of your ${monthly_budget} budget. You are doing well, but watch out for impulse buys."
            })
        elif 0 < spending_ratio < 0.2:
            insights.append({
                "category": "Finance",
                "type": "success",
                "message": "Frugal Mastermind! Your spending is well below budget limits. Your pocket thanks you."
            })
            
        # Add a default insight if list is empty
        if not insights:
            insights.append({
                "category": "General",
                "type": "info",
                "message": "Welcome to LifeTracker AI! Start logging habits, tracking expenses, and creating goals. I will analyze your patterns and deliver custom insights here."
            })
            
        # ====================================================
        # FUTURE LLM INTEGRATION PLACEHOLDER
        # ====================================================
        # To integrate with OpenAI, you can do:
        #
        # import openai
        # client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        #
        # prompt = f"Analyze these habits: {habits}, goals: {goals}, spending: {expense_stats} and logs: {logs} and write 3 short bullet points of coaching advice."
        # response = client.chat.completions.create(
        #     model="gpt-4-turbo",
        #     messages=[{"role": "user", "content": prompt}]
        # )
        # # Parse response and append to insights list.
        # ====================================================
        
        return insights

ai_service = AIService()
