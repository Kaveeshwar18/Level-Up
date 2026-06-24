from fastapi import APIRouter, Depends
import datetime
from app.services.habit import habit_service
from app.services.goal import goal_service
from app.services.expense import expense_service
from app.services.achievement import achievement_service
from app.services.ai import ai_service
from app.routers.dependencies import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    # Fetch all raw data
    habits = await habit_service.get_habits_with_stats(user_id)
    goals = await goal_service.get_goals(user_id)
    expense_stats = await expense_service.get_spending_stats(user_id)
    achievements = await achievement_service.get_user_achievements(user_id)
    ai_insights = await ai_service.generate_insights(user_id)
    all_logs = await habit_service.get_all_user_logs(user_id)
    
    # 1. Dashboard Summary Stats
    total_habits = len(habits)
    max_streak = max([h.get("currentStreak", 0) for h in habits]) if habits else 0
    avg_completion_rate = round(sum([h.get("completionRate", 0.0) for h in habits]) / total_habits, 1) if habits else 0.0
    
    completed_today_count = sum([1 for h in habits if h.get("isCompletedToday", False)])
    today_progress = round((completed_today_count / total_habits) * 100, 1) if total_habits > 0 else 0.0
    
    # 2. Habit Completion Trend (Last 30 days)
    today = datetime.date.today()
    last_30_days = [today - datetime.timedelta(days=i) for i in range(29, -1, -1)]
    completion_trend = []
    
    # Pre-aggregate logs by date
    log_map = {}
    for log in all_logs:
        if log.get("completed", True):
            date_str = log["date"]
            log_map[date_str] = log_map.get(date_str, 0) + 1
            
    for d in last_30_days:
        d_str = d.strftime("%Y-%m-%d")
        completion_trend.append({
            "date": d.strftime("%b %d"),
            "completedCount": log_map.get(d_str, 0)
        })
        
    # 3. Weekly Performance (Mon-Sun completions sum over all history)
    weekday_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_perf = {name: 0 for name in weekday_names}
    
    for log in all_logs:
        if log.get("completed", True):
            try:
                dt_obj = datetime.datetime.strptime(log["date"], "%Y-%m-%d")
                day_name = weekday_names[dt_obj.weekday()]
                weekly_perf[day_name] += 1
            except Exception:
                continue
                
    weekly_performance_data = [{"day": k, "completedCount": v} for k, v in weekly_perf.items()]
    
    # 4. Category Breakdown
    category_counts = {}
    for h in habits:
        cat = h.get("category", "Custom")
        category_counts[cat] = category_counts.get(cat, 0) + 1
    category_breakdown_data = [{"name": k, "value": v} for k, v in category_counts.items()]
    if not category_breakdown_data:
        category_breakdown_data = [{"name": "None", "value": 0}]
        
    # 5. Productivity Score (Last 14 days)
    # Productivity score on day D = (completed habits / total habits active on day D) * 100
    last_14_days = [today - datetime.timedelta(days=i) for i in range(13, -1, -1)]
    productivity_scores = []
    
    for d in last_14_days:
        d_str = d.strftime("%Y-%m-%d")
        # How many habits were active (created on or before d)
        active_habits_on_day = 0
        completed_on_day = log_map.get(d_str, 0)
        
        for h in habits:
            created_at = h.get("createdAt")
            if isinstance(created_at, str):
                try:
                    created_date = datetime.datetime.fromisoformat(created_at.replace("Z", "+00:00")).date()
                except Exception:
                    created_date = today
            elif isinstance(created_at, datetime.datetime):
                created_date = created_at.date()
            else:
                created_date = today
                
            if created_date <= d:
                active_habits_on_day += 1
                
        # Handle edge cases
        if active_habits_on_day == 0:
            score = 0.0
        else:
            # Score shouldn't exceed 100%
            score = round((completed_on_day / active_habits_on_day) * 100, 1)
            if score > 100.0:
                score = 100.0
                
        productivity_scores.append({
            "date": d.strftime("%b %d"),
            "score": score
        })
        
    # 6. Monthly Growth (Last 6 months completions)
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_growth = []
    
    # Get last 6 months
    current_year = today.year
    current_month = today.month
    
    months_to_check = []
    for i in range(5, -1, -1):
        m = current_month - i
        y = current_year
        if m <= 0:
            m += 12
            y -= 1
        months_to_check.append((y, m))
        
    for y, m in months_to_check:
        month_label = f"{month_names[m-1]} {str(y)[2:]}"
        completions_in_month = 0
        for log in all_logs:
            if log.get("completed", True):
                try:
                    dt_obj = datetime.datetime.strptime(log["date"], "%Y-%m-%d")
                    if dt_obj.year == y and dt_obj.month == m:
                        completions_in_month += 1
                except Exception:
                    continue
        monthly_growth.append({
            "month": month_label,
            "completions": completions_in_month
        })
        
    return {
        "summary": {
            "currentStreak": max_streak,
            "totalHabits": total_habits,
            "completionRate": avg_completion_rate,
            "todayProgress": today_progress,
            "completedTodayCount": completed_today_count
        },
        "charts": {
            "completionTrend": completion_trend,
            "weeklyPerformance": weekly_performance_data,
            "categoryBreakdown": category_breakdown_data,
            "productivityScore": productivity_scores,
            "monthlyGrowth": monthly_growth
        },
        "goals": goals,
        "expenseStats": expense_stats,
        "achievements": achievements,
        "aiInsights": ai_insights
    }
