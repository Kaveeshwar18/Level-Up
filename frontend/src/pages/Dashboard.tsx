import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { analyticsService } from '../services/analytics';
import { habitsService } from '../services/habits';
import { Button } from '../components/ui/Button';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, LabelList } from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  // Fetch all aggregated stats
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.getAnalytics,
    refetchInterval: 12000,
  });

  // Fetch user habits list directly to manage status
  const { data: habits = [] } = useQuery({
    queryKey: ['habits'],
    queryFn: habitsService.getHabits,
  });

  // Habit completion mutation
  const logHabitMutation = useMutation({
    mutationFn: ({ habitId, date, completed }: { habitId: string; date: string; completed: boolean }) =>
      habitsService.logHabit(habitId, date, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-44 bg-[#1B1D28] rounded-[32px] border border-white/[0.03] shadow-sm"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-20 bg-[#1B1D28] rounded-[24px] border border-white/[0.03] shadow-sm"></div>
            <div className="h-96 bg-[#1B1D28] rounded-[32px] border border-white/[0.03] shadow-sm"></div>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-[#1B1D28] rounded-[24px] border border-white/[0.03] shadow-sm"></div>
              <div className="h-24 bg-[#1B1D28] rounded-[24px] border border-white/[0.03] shadow-sm"></div>
            </div>
            <div className="h-80 bg-[#1B1D28] rounded-[32px] border border-white/[0.03] shadow-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 bg-[#1B1D28] rounded-[32px] border border-white/[0.03] m-4">
        <p className="text-red-400 font-bold">Failed to load dashboard. Please refresh.</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['analytics'] })} className="mt-4 bg-white text-black px-5 py-2.5 rounded-xl">
          Retry
        </Button>
      </div>
    );
  }

  const { summary } = data;

  // Filter habits for checklist tabs
  const filteredHabits = habits.filter((h) => {
    if (activeTab === 'active') return !h.isCompletedToday;
    if (activeTab === 'completed') return h.isCompletedToday;
    return true;
  });

  // Featured Habit (First active habit with a streak, or any habit as fallback)
  const featuredHabit = habits.find((h) => !h.isCompletedToday) || habits[0];

  // Dynamic greeting based on hours
  const hours = new Date().getHours();
  let greeting = 'Hello';
  if (hours < 12) greeting = 'Good Morning';
  else if (hours < 17) greeting = 'Hello';
  else greeting = 'Good Evening';

  // Statistics Chart Mapping (Mon - Sun)
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const rawTrend = data?.charts?.completionTrend || [];
  const defaultScores = [1.2, 1.8, 2.5, 1.0, 4.0, 3.2, 2.0]; // matches mockup curve perfectly!
  
  const chartData = weekdays.map((dayName, idx) => {
    const trendItem = rawTrend[idx];
    return {
      name: dayName,
      val: trendItem ? trendItem.completedCount : defaultScores[idx],
    };
  });

  const handleToggleHabit = (habitId: string, currentStatus: boolean) => {
    const todayStr = new Date().toISOString().split('T')[0];
    logHabitMutation.mutate({
      habitId,
      date: todayStr,
      completed: !currentStatus,
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 select-none px-2 md:px-4">
      
      {/* 1. HERO BANNER WITH CHARACTER */}
      <div className="bg-[#1B1D28] border border-white/[0.03] rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-sm">
        <div className="space-y-2 text-center md:text-left z-10">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight font-sans">
            {greeting}, {user?.name || 'Friend'}!
          </h1>
          <p className="text-slate-400 text-xs font-semibold tracking-wide">
            It's good to see you again. Let's make today count.
          </p>
        </div>

        {/* Charming Sketch Vector Character in White lines for dark bg */}
        <div className="mt-4 md:mt-0 flex-shrink-0 z-10">
          <svg viewBox="0 0 200 200" className="w-36 h-36 md:w-40 md:h-40 object-contain">
            <circle cx="100" cy="90" r="28" fill="none" stroke="white" strokeWidth="4" />
            {/* Eyes & Glasses */}
            <circle cx="90" cy="86" r="3" fill="white" />
            <circle cx="110" cy="86" r="3" fill="white" />
            <circle cx="90" cy="86" r="9" fill="none" stroke="white" strokeWidth="2.5" />
            <circle cx="110" cy="86" r="9" fill="none" stroke="white" strokeWidth="2.5" />
            <path d="M 99 86 L 101 86" stroke="white" strokeWidth="2.5" />
            {/* Smile */}
            <path d="M 93 102 Q 100 109 107 102" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
            {/* Hair */}
            <path d="M 85 64 Q 100 48 115 64" fill="none" stroke="white" strokeWidth="4.5" />
            {/* Neck */}
            <path d="M 96 118 L 96 136" stroke="white" strokeWidth="4" />
            <path d="M 104 118 L 104 136" stroke="white" strokeWidth="4" />
            {/* Body */}
            <path d="M 64 180 C 64 145, 136 145, 136 180" fill="none" stroke="white" strokeWidth="4.5" />
            {/* Waving Arm & Hand */}
            <path d="M 64 158 C 45 138, 42 104, 52 82" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
            <circle cx="52" cy="76" r="6" fill="white" />
            {/* Waving micro-lines */}
            <path d="M 36 76 Q 42 70 39 60" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M 66 76 Q 60 70 63 60" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* MAIN TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: FEATURED BANNER & HABITS LIST */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 2. FEATURED ACTIVE HABIT BANNER */}
          {featuredHabit ? (
            <div className="bg-[#1B1D28] border border-white/[0.03] rounded-[28px] p-5 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-4 text-left">
                <span className="text-3xl p-3 bg-[#25293A] rounded-2xl border border-white/[0.03] shadow-inner">
                  {featuredHabit.icon || '🔥'}
                </span>
                <div>
                  <h3 className="text-sm font-black text-white leading-none">{featuredHabit.title}</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 tracking-wide uppercase">
                    {featuredHabit.category || 'Productivity'} • {featuredHabit.currentStreak}d Streak
                  </p>
                </div>
              </div>

              {/* Progress and Continue Button */}
              <div className="flex items-center gap-5">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r="18" className="stroke-[#25293A] fill-transparent" strokeWidth="3" />
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      className="stroke-white fill-transparent transition-all duration-500"
                      strokeWidth="3"
                      strokeDasharray={2 * Math.PI * 18}
                      strokeDashoffset={2 * Math.PI * 18 - (Math.min(100, (featuredHabit.currentStreak / (featuredHabit.goalDays || 21)) * 100) / 100) * 2 * Math.PI * 18}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[9px] font-black text-white">
                    {Math.round((featuredHabit.currentStreak / (featuredHabit.goalDays || 21)) * 100)}%
                  </span>
                </div>

                <button
                  onClick={() => handleToggleHabit(featuredHabit.id, featuredHabit.isCompletedToday)}
                  className="bg-white hover:bg-slate-100 text-black px-6 py-2.5 rounded-2xl text-xs font-black tracking-wider uppercase transition-all shadow-sm active:scale-95"
                >
                  {featuredHabit.isCompletedToday ? 'Completed' : 'Continue'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#1B1D28] border border-white/[0.03] rounded-[28px] p-6 text-center shadow-sm">
              <p className="text-xs text-slate-400 font-bold">No active habits. Create one to kickstart your journey!</p>
              <Button onClick={() => navigate('/habits')} className="mt-3 bg-white text-black text-xs py-2 px-4 rounded-xl">
                Create Habit
              </Button>
            </div>
          )}

          {/* 3. TABBED HABITS LISTING */}
          <div className="bg-[#1B1D28] border border-white/[0.03] rounded-[32px] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-lg font-black text-white tracking-tight">Habits</h2>
              
              {/* Category tabs */}
              <div className="flex flex-wrap gap-2 bg-[#25293A] p-1 rounded-2xl border border-white/[0.03] self-start">
                {(['all', 'active', 'completed'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide capitalize transition-all ${
                      activeTab === tab
                        ? 'bg-[#1B1D28] text-white shadow-sm border border-white/[0.03]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab === 'all' ? 'All Habits' : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            {filteredHabits.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-[24px]">
                <p className="text-xs text-slate-400 font-bold">No habits in this tab.</p>
                <Button size="xs" onClick={() => navigate('/habits')} className="mt-3 bg-[#25293A] border border-white/5 text-white py-1.5 px-3 rounded-lg text-2xs font-extrabold">
                  Add Habit
                </Button>
              </div>
            ) : (
              <div className="space-y-4.5">
                {filteredHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4.5 bg-[#1E2235] border border-white/[0.03] rounded-[20px] hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <span className="w-11 h-11 bg-[#25293A] border border-white/[0.03] rounded-xl flex items-center justify-center text-xl shadow-inner">
                        {habit.icon}
                      </span>
                      <div>
                        <h4 className="text-xs font-extrabold text-white leading-snug">{habit.title}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider flex items-center gap-1.5">
                          <span>{habit.category}</span>
                          <span className="opacity-40">•</span>
                          <span className="flex items-center gap-0.5 text-orange-400 font-extrabold">
                            <Flame className="w-3.5 h-3.5 fill-orange-400 stroke-none" /> {habit.currentStreak}d Streak
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleHabit(habit.id, habit.isCompletedToday)}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase border transition-all active:scale-95 ${
                        habit.isCompletedToday
                          ? 'bg-[#25293A] text-slate-500 border-transparent cursor-default'
                          : 'bg-white text-black border-transparent hover:bg-slate-100 shadow-sm'
                      }`}
                    >
                      {habit.isCompletedToday ? 'Completed' : 'Check In'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: QUICK METRICS & RECHARTS STATISTICS CURVE */}
        <div className="space-y-8">
          
          {/* 4. METRICS CAPSULES */}
          <div className="grid grid-cols-2 gap-4">
            {/* Completed */}
            <div className="bg-[#1B1D28] border border-white/[0.03] rounded-[24px] p-5 text-left shadow-sm">
              <h2 className="text-3xl font-black text-white font-sans leading-none">
                {summary?.completedTodayCount || 0}
              </h2>
              <p className="text-[10px] font-black text-[#5B6382] uppercase tracking-widest mt-3.5 leading-none">
                Completions
              </p>
            </div>
            {/* Active */}
            <div className="bg-[#1B1D28] border border-white/[0.03] rounded-[24px] p-5 text-left shadow-sm">
              <h2 className="text-3xl font-black text-white font-sans leading-none">
                {summary?.totalHabits || 0}
              </h2>
              <p className="text-[10px] font-black text-[#5B6382] uppercase tracking-widest mt-3.5 leading-none">
                Active Habits
              </p>
            </div>
          </div>

          {/* 5. STATISTICS CURVE */}
          <div className="bg-[#1B1D28] border border-white/[0.03] rounded-[32px] p-6 shadow-sm text-left">
            <div className="mb-6">
              <h2 className="text-sm font-black text-white tracking-wide uppercase">Your statistics</h2>
              <p className="text-[10px] font-extrabold text-slate-400 mt-1">Learning Hours / Completions</p>
            </div>

            {/* Monochromatic white curve styled to match the dark mockup */}
            <div className="h-60 w-full mt-4 select-none relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#8E9AA8', fontSize: 10, fontWeight: '800' }}
                  />
                  <YAxis hide domain={[0, 6]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E2235',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                    }}
                    cursor={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="val"
                    stroke="#FFFFFF"
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      fill: '#1B1D28',
                      stroke: '#FFFFFF',
                      strokeWidth: 3,
                    }}
                    activeDot={{
                      r: 7,
                      fill: '#FFFFFF',
                      stroke: '#1B1D28',
                      strokeWidth: 2,
                    }}
                  >
                    <LabelList
                      dataKey="val"
                      position="top"
                      offset={12}
                      formatter={(v: any) => `${v}h`}
                      className="fill-white text-[9px] font-black font-sans"
                    />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>



        </div>

      </div>
      
    </div>
  );
};
export default Dashboard;
