export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  goalDays: number;
  icon: string;
  color: string;
  createdAt: string;
  currentStreak: number;
  maxStreak: number;
  completionRate: number;
  isCompletedToday: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  deadline: string; // YYYY-MM-DD
  createdAt: string;
  progressPercentage: number;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Journal {
  id: string;
  userId: string;
  content: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Achievement {
  id: string;
  userId: string;
  badge: 'first_habit' | 'streak_7' | 'streak_30' | 'consistency_king' | 'goal_crusher';
  earnedAt: string;
}

export interface SpendingStats {
  todaySpending: number;
  monthlySpending: number;
  monthlyBudget: number;
  budgetRemaining: number;
  categoryBreakdown: { name: string; value: number }[];
}

export interface AIInsight {
  category: string;
  type: 'success' | 'warning' | 'info' | 'danger';
  message: string;
}

export interface DashboardSummary {
  currentStreak: number;
  totalHabits: number;
  completionRate: number;
  todayProgress: number;
  completedTodayCount: number;
}

export interface AnalyticsCharts {
  completionTrend: { date: string; completedCount: number }[];
  weeklyPerformance: { day: string; completedCount: number }[];
  categoryBreakdown: { name: string; value: number }[];
  productivityScore: { date: string; score: number }[];
  monthlyGrowth: { month: string; completions: number }[];
}

export interface DashboardData {
  summary: DashboardSummary;
  charts: AnalyticsCharts;
  goals: Goal[];
  expenseStats: SpendingStats;
  achievements: Achievement[];
  aiInsights: AIInsight[];
}
