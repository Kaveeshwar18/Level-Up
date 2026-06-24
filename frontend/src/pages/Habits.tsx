import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';
import habitsService from '../services/habits';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Habits: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any | null>(null);
  
  // Grid month/year filter state
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  // Fetch user habits
  const { data: habits, isLoading: habitsLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: habitsService.getHabits,
  });

  // Fetch all completion logs (via our parallel Promise.all logger)
  const { data: allLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['all-logs-grid'],
    queryFn: async () => {
      const list = await habitsService.getHabits();
      const result: Record<string, Set<string>> = {}; // date -> Set of completed habitIds
      
      await Promise.all(
        list.map(async (h) => {
          const logs = await habitsService.getHabitLogs(h.id);
          logs.forEach((log) => {
            if (log.completed) {
              if (!result[log.date]) result[log.date] = new Set();
              result[log.date].add(h.id);
            }
          });
        })
      );
      return result;
    }
  });

  // Mutations
  const createHabitMutation = useMutation({
    mutationFn: habitsService.createHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['all-logs-grid'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setIsCreateModalOpen(false);
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => habitsService.updateHabit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['all-logs-grid'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setEditingHabit(null);
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: habitsService.deleteHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['all-logs-grid'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const logHabitMutation = useMutation({
    mutationFn: ({ habitId, date, completed }: { habitId: string; date: string; completed: boolean }) =>
      habitsService.logHabit(habitId, date, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['all-logs-grid'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  if (habitsLoading || logsLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800/50 rounded-xl"></div>
        <div className="h-96 bg-slate-800/50 rounded-3xl border border-white/5"></div>
      </div>
    );
  }

  const list = habits || [];
  const logs = allLogs || {};

  // Delete habit
  const handleDeleteHabit = (id: string) => {
    if (confirm('Are you sure you want to delete this habit? All history logs will be lost.')) {
      deleteHabitMutation.mutate(id);
    }
  };

  // Switch month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Calculate day details of the selected month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
  const startDateStr = `01/${String(currentMonth + 1).padStart(2, '0')}/${currentYear}`;

  // Week column ranges (Total 35 cells to make 5 complete weeks of 7 days)
  const totalGridDays = 35;
  
  // Week configurations (color gradients)
  const weekConfigs = [
    { name: 'WEEK 1', color: 'from-rose-500 to-red-400', border: 'border-rose-500/20', text: 'text-rose-400' },
    { name: 'WEEK 2', color: 'from-amber-500 to-yellow-400', border: 'border-amber-500/20', text: 'text-amber-400' },
    { name: 'WEEK 3', color: 'from-emerald-500 to-teal-400', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    { name: 'WEEK 4', color: 'from-orange-500 to-amber-400', border: 'border-orange-500/20', text: 'text-orange-400' },
    { name: 'WEEK 5', color: 'from-purple-500 to-indigo-400', border: 'border-purple-500/20', text: 'text-purple-400' },
  ];

  // Helper to get date string for col index
  const getDateStr = (dayIndex: number): string => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayIndex).padStart(2, '0')}`;
  };

  // Helper to get weekday letter for a day index
  const getWeekdayLetter = (dayIndex: number): string => {
    const d = new Date(currentYear, currentMonth, dayIndex);
    return d.toLocaleString('default', { weekday: 'narrow' }); // M, T, W, T, F, S, S
  };

  // Toggle cell log
  const handleToggleCell = (habitId: string, dayIndex: number) => {
    if (dayIndex > daysInMonth) return; // Pad cells are disabled
    const dateStr = getDateStr(dayIndex);
    const completedSet = logs[dateStr];
    const isCompleted = completedSet ? completedSet.has(habitId) : false;
    
    logHabitMutation.mutate({
      habitId,
      date: dateStr,
      completed: !isCompleted,
    });
  };

  // Pad the list of habits to exactly 10 rows if they have fewer (keeps layout identical to sheet)
  const paddedHabits: any[] = [...list];
  const placeholderCount = Math.max(0, 10 - list.length);
  for (let i = 0; i < placeholderCount; i++) {
    paddedHabits.push({
      id: `placeholder-${i}`,
      title: `Other Habit ${list.length + i + 1}`,
      isPlaceholder: true,
    });
  }

  // Calculate daily completion percentages
  const dailyCompletionRates = Array.from({ length: totalGridDays }, (_, idx) => {
    const day = idx + 1;
    if (day > daysInMonth || list.length === 0) return 0;
    
    const dateStr = getDateStr(day);
    const completedSet = logs[dateStr];
    if (!completedSet) return 0;
    
    const completedCount = list.filter((h) => completedSet.has(h.id)).length;
    return Math.round((completedCount / list.length) * 100);
  });

  // Calculate weekly summary stats
  const weeklyStats = weekConfigs.map((_, weekIdx) => {
    if (list.length === 0) return { completed: 0, potential: 0, percent: 0 };
    
    let completedCount = 0;
    let activeDaysCount = 0;

    for (let d = 1; d <= 7; d++) {
      const day = weekIdx * 7 + d;
      if (day <= daysInMonth) {
        activeDaysCount++;
        const dateStr = getDateStr(day);
        const completedSet = logs[dateStr];
        if (completedSet) {
          completedCount += list.filter((h) => completedSet.has(h.id)).length;
        }
      }
    }

    const potentialCompletions = list.length * activeDaysCount;
    const percent = potentialCompletions > 0 ? Math.round((completedCount / potentialCompletions) * 100) : 0;

    return {
      completed: completedCount,
      potential: potentialCompletions,
      percent,
    };
  });

  return (
    <div className="space-y-8">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 bg-slate-900/40 p-6 rounded-3xl border border-white/5">
        <div className="flex flex-wrap items-center gap-6 select-none">
          <div className="bg-rose-500/10 border border-rose-500/20 px-5 py-3 rounded-2xl text-center min-w-[140px]">
            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Month</p>
            <h2 className="text-lg font-extrabold text-slate-100 mt-1">{monthName} {currentYear}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-slate-950/40 border border-white/5 px-5 py-3 rounded-2xl text-center min-w-[140px]">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Start Date</p>
            <h2 className="text-xs font-bold text-slate-300 mt-1.5">{startDateStr}</h2>
          </div>
        </div>

        <div className="self-start md:self-center">
          <Button onClick={() => setIsCreateModalOpen(true)} className="py-2.5 px-4">
            <Plus className="w-4 h-4" /> Add Daily Habit
          </Button>
        </div>
      </div>

      {/* Spreadsheet Grid Wrapper */}
      <GlassCard className="p-0 overflow-hidden border border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <div className="min-w-[1280px]">
            
            {/* 1. TABLE HEADER: WEEK headers and vertical bars */}
            <div className="flex border-b border-white/10">
              
              {/* Sticky Top-Left Corner */}
              <div className="w-[280px] bg-slate-900/60 flex items-center justify-center p-4 border-r border-white/10 sticky left-0 z-10 select-none">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Daily Habits</span>
              </div>

              {/* Weekly Groups (7 columns each) */}
              <div className="flex-1 flex divide-x divide-white/10">
                {weekConfigs.map((w, idx) => (
                  <div key={w.name} className="w-[200px] flex-shrink-0 text-center flex flex-col justify-between py-2 bg-slate-950/20">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${w.text} select-none`}>
                      {w.name}
                    </span>
                    
                    {/* Vertical daily bars */}
                    <div className="flex justify-around items-end h-24 px-2 mt-3 select-none">
                      {Array.from({ length: 7 }, (_, dayIdx) => {
                        const dayNum = idx * 7 + dayIdx + 1;
                        const rate = dailyCompletionRates[dayNum - 1];
                        const isDayActive = dayNum <= daysInMonth;
                        
                        return (
                          <div key={dayIdx} className="flex flex-col items-center justify-end h-full w-5 relative group/bar">
                            {isDayActive ? (
                              <>
                                <div className="absolute bottom-full mb-1.5 hidden group-hover/bar:block bg-slate-950 px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-300 z-20 shadow-md">
                                  {rate}%
                                </div>
                                <div
                                  className={`w-2.5 bg-gradient-to-t ${w.color} rounded-t-sm transition-all duration-500`}
                                  style={{ height: `${rate}%` }}
                                />
                                <span className="text-[8px] text-slate-500 font-bold mt-1.5 scale-90">{rate}%</span>
                              </>
                            ) : (
                              <div className="w-2.5 h-1 bg-slate-950/20 rounded-t-sm" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. GRID DETAILS ROW: Calendar Day, Weekday, Days */}
            <div className="flex border-b border-white/5 bg-slate-950/40 text-[10px] font-bold text-slate-400 select-none">
              <div className="w-[280px] border-r border-white/10 p-3.5 sticky left-0 z-10 bg-slate-900/90 text-right pr-6 flex flex-col gap-2 justify-center shadow-md">
                <p className="uppercase tracking-widest text-[9px] text-slate-500">Calendar Day</p>
                <p className="uppercase tracking-widest text-[9px] text-slate-500">Weekday</p>
                <p className="uppercase tracking-widest text-[9px] text-slate-500">Days</p>
              </div>

              <div className="flex-1 flex divide-x divide-white/5">
                {weekConfigs.map((_, weekIdx) => (
                  <div key={weekIdx} className="w-[200px] flex-shrink-0 flex justify-around p-2 text-center bg-slate-950/10">
                    {Array.from({ length: 7 }, (_, dayIdx) => {
                      const dayNum = weekIdx * 7 + dayIdx + 1;
                      const isDayActive = dayNum <= daysInMonth;
                      const weekdayLetter = isDayActive ? getWeekdayLetter(dayNum) : '-';
                      const isWeekend = isDayActive && (weekdayLetter === 'S');

                      return (
                        <div key={dayIdx} className="w-7 flex flex-col gap-2 justify-center items-center font-bold">
                          <span className={isDayActive ? 'text-slate-300' : 'text-slate-700'}>{isDayActive ? dayNum : '-'}</span>
                          <span className={isWeekend ? 'text-primary-light' : isDayActive ? 'text-slate-400' : 'text-slate-700'}>
                            {weekdayLetter}
                          </span>
                          <span className={isDayActive ? 'text-slate-500' : 'text-slate-700'}>{isDayActive ? dayNum : '-'}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. HABIT ROWS GRID */}
            <div className="divide-y divide-white/5">
              {paddedHabits.map((habit, habitIdx) => {
                const isPlaceholder = habit.isPlaceholder;
                return (
                  <div key={habit.id} className="flex group/row hover:bg-white/5 transition-colors">
                    
                    {/* Sticky left habit card */}
                    <div className="w-[280px] border-r border-white/10 p-3 sticky left-0 z-10 bg-slate-900/90 flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-3.5 pl-2 overflow-hidden">
                        <span className="text-[10px] font-bold text-slate-500">{habitIdx + 1}</span>
                        {isPlaceholder ? (
                          <span className="text-xs font-semibold text-slate-600 italic truncate">{habit.title}</span>
                        ) : (
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="text-sm flex-shrink-0">{habit.icon}</span>
                            <span className="text-xs font-bold text-slate-200 truncate group-hover/row:text-primary-light transition-colors">
                              {habit.title}
                            </span>
                          </div>
                        )}
                      </div>

                      {!isPlaceholder && (
                        <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity pr-2">
                          <button
                            onClick={() => setEditingHabit(habit)}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5"
                            title="Edit Habit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteHabit(habit.id)}
                            className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-transparent hover:border-red-500/20"
                            title="Delete Habit"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Checkbox columns */}
                    <div className="flex-1 flex divide-x divide-white/5 select-none">
                      {weekConfigs.map((_, weekIdx) => (
                        <div key={weekIdx} className="w-[200px] flex-shrink-0 flex justify-around items-center p-2">
                          {Array.from({ length: 7 }, (_, dayIdx) => {
                            const dayNum = weekIdx * 7 + dayIdx + 1;
                            const isDayActive = dayNum <= daysInMonth;
                            
                            const dateStr = getDateStr(dayNum);
                            const completedSet = logs[dateStr];
                            const isCompleted = completedSet && !isPlaceholder ? completedSet.has(habit.id) : false;

                            const weekBgColors = [
                              'bg-rose-500 border-rose-500 shadow-rose-500/25',
                              'bg-amber-500 border-amber-500 shadow-amber-500/25',
                              'bg-emerald-500 border-emerald-500 shadow-emerald-500/25',
                              'bg-orange-500 border-orange-500 shadow-orange-500/25',
                              'bg-purple-500 border-purple-500 shadow-purple-500/25',
                            ];
                            const activeColorClass = weekBgColors[weekIdx] || 'bg-white border-white';

                            return (
                              <div key={dayIdx} className="w-7 flex items-center justify-center">
                                {isDayActive && !isPlaceholder ? (
                                  <button
                                    onClick={() => handleToggleCell(habit.id, dayNum)}
                                    className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all active:scale-90 shadow-sm ${
                                      isCompleted
                                        ? `${activeColorClass} scale-105 text-white`
                                        : 'bg-white/5 border-white/20 hover:border-white/45 hover:bg-white/10'
                                    }`}
                                    title={`Day ${dayNum} - ${isCompleted ? 'Completed' : 'Not completed'}`}
                                  >
                                    {isCompleted && (
                                      <span className="text-[9px] font-black text-white leading-none">✓</span>
                                    )}
                                  </button>
                                ) : (
                                  <div className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* 4. FOOTER: Weekly Completion & Progress radial rings */}
            <div className="flex border-t border-white/10 bg-slate-950/40 text-[10px] font-bold text-slate-400 select-none">
              <div className="w-[280px] border-r border-white/10 p-6 sticky left-0 z-10 bg-slate-900/90 text-right pr-6 flex flex-col justify-around min-h-[160px] shadow-md">
                <div>
                  <p className="uppercase tracking-widest text-[9px] text-slate-500">Weekly Completion Status</p>
                </div>
                <div className="mt-12">
                  <p className="uppercase tracking-widest text-[9px] text-slate-500">Weekly Progress</p>
                </div>
              </div>

              <div className="flex-1 flex divide-x divide-white/10">
                {weekConfigs.map((w, weekIdx) => {
                  const stat = weeklyStats[weekIdx];
                  const radius = 26;
                  const circumference = 2 * Math.PI * radius;
                  const strokeDashoffset = circumference - (stat.percent / 100) * circumference;

                  return (
                    <div key={weekIdx} className="w-[200px] flex-shrink-0 flex flex-col justify-between p-4 min-h-[160px] bg-slate-950/20">
                      
                      {/* Weekly Fraction */}
                      <div className="text-center bg-slate-950/30 p-2 rounded-xl border border-white/5 text-slate-300 flex items-center justify-center gap-1 font-mono">
                        <span className={`font-extrabold ${w.text}`}>{stat.completed}</span>
                        <span className="opacity-40">/</span>
                        <span>{stat.potential}</span>
                      </div>

                      {/* Radial Ring */}
                      <div className="flex flex-col items-center justify-center mt-3 relative">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            className="stroke-slate-950 fill-transparent"
                            strokeWidth="5.5"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            className="fill-transparent transition-all duration-700 ease-out"
                            strokeWidth="5.5"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            style={{
                              stroke: `url(#gradient-${weekIdx})`,
                            }}
                          />
                          
                          <defs>
                            <linearGradient id={`gradient-${weekIdx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style={{ stopColor: weekIdx === 0 ? '#F43F5E' : weekIdx === 1 ? '#F59E0B' : weekIdx === 2 ? '#10B981' : weekIdx === 3 ? '#F97316' : '#A855F7' }} />
                              <stop offset="100%" style={{ stopColor: weekIdx === 0 ? '#F87171' : weekIdx === 1 ? '#FBBF24' : weekIdx === 2 ? '#2DD4BF' : weekIdx === 3 ? '#FBBF24' : '#818CF8' }} />
                            </linearGradient>
                          </defs>
                        </svg>

                        <div className="absolute inset-0 flex items-center justify-center mt-3">
                          <span className="text-[10px] font-extrabold text-slate-100">{stat.percent}%</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </GlassCard>

      {/* Create/Edit Modals */}
      <AnimatePresence>
        {(isCreateModalOpen || editingHabit) && (
          <HabitFormModal
            habit={editingHabit}
            onClose={() => {
              setIsCreateModalOpen(false);
              setEditingHabit(null);
            }}
            onSubmit={(data) => {
              if (editingHabit) {
                updateHabitMutation.mutate({ id: editingHabit.id, data });
              } else {
                createHabitMutation.mutate(data);
              }
            }}
            isLoading={createHabitMutation.isPending || updateHabitMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Form modal for Creating and Editing habits
interface FormProps {
  habit?: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const HabitFormModal: React.FC<FormProps> = ({ habit, onClose, onSubmit, isLoading }) => {
  const [title, setTitle] = useState(habit ? habit.title : '');
  const [description, setDescription] = useState(habit ? habit.description : '');
  const [category, setCategory] = useState(habit ? habit.category : 'Productivity');
  const [goalDays, setGoalDays] = useState(habit ? habit.goalDays : 21);
  const [icon, setIcon] = useState(habit ? habit.icon : '🔥');
  const [color, setColor] = useState(habit ? habit.color : '#7C3AED');

  const categories = ['Health', 'Fitness', 'Study', 'Finance', 'Productivity', 'Custom'];
  const emojis = ['🔥', '💪', '📚', '💰', '💼', '💧', '🍎', '🧘', '🚶', '🧠', '✍️', '😴', '💊', '🧹'];
  const colors = [
    '#7C3AED', // Violet
    '#4F46E5', // Indigo
    '#06B6D4', // Cyan
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#8B5CF6', // Purple
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      category,
      goalDays: Number(goalDays),
      icon,
      color,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg glass-card border border-white/15 rounded-3xl p-6 shadow-2xl relative z-10 overflow-y-auto max-h-[90vh]"
      >
        <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary-light" />
          {habit ? 'Edit Habit settings' : 'Create New Habit'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Habit Title"
            type="text"
            required
            placeholder="e.g., Read 15 pages, 6:00 AM Gym"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
            <textarea
              className="glass-input px-4 py-3 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary/25 resize-none h-20"
              placeholder="Why are you building this habit? What is your strategy?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">Category</label>
              <select
                className="glass-input px-4 py-3 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-primary/25 bg-slate-900"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Target Days (Goal)"
              type="number"
              min={1}
              max={365}
              required
              value={goalDays}
              onChange={(e) => setGoalDays(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Select Icon</label>
            <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-slate-950/30 border border-white/5 max-h-24 overflow-y-auto">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-all ${
                    icon === emoji
                      ? 'border-primary bg-primary/25 scale-105'
                      : 'border-white/5 bg-transparent hover:bg-white/5'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Select Theme Color</label>
            <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-slate-950/30 border border-white/5">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full border border-white/10 transition-all flex items-center justify-center"
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <span className="w-2.5 h-2.5 bg-white rounded-full shadow-md animate-ping"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading} className="py-2.5 px-4">
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} className="py-2.5 px-5">
              {habit ? 'Save Changes' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
export default Habits;
