import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  FileText,
  Edit2,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import habitsService from '../services/habits';
import journalService from '../services/journal';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split('T')[0]);

  // Fetch habits (contains raw list)
  const { data: habits, isLoading: habitsLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: habitsService.getHabits,
  });

  // Fetch all logs for the user to map calendar ticks
  const { data: allLogs } = useQuery({
    queryKey: ['all-logs'],
    queryFn: async () => {
      // Get logs from the first habit or fetch all user logs
      // Since our analytics endpoint returns all logs, let's query the analytics endpoint!
      // Actually, we can fetch all habit logs. Let's write a quick service or fetch.
      // Wait! We can just fetch the logs. We have `habitsService.getHabitLogs` for individual habits,
      // but wait! Can we fetch all logs? In `habitsService` we don't have a direct `getAllUserLogs` in frontend service yet,
      // but wait! We can just fetch the analytics dataset which contains all user logs in `charts.completionTrend` or we can call individual endpoints.
      // Let's add a generic endpoint helper or fetch all logs.
      // Wait, we did implement `get_all_user_logs(user_id)` in the backend habit service, but we didn't expose a dedicated `/habits/logs` endpoint,
      // though we do have it inside `/analytics`!
      // In `/analytics` response, we returned:
      // `summary`, `charts`, `goals`, `expenseStats`, `achievements`, `aiInsights`.
      // Wait! In `/analytics`, we pre-aggregated the logs into `charts.completionTrend` and `charts.weeklyPerformance`!
      // Can we query `/analytics` to get the general data? Yes! It is extremely handy.
      // But wait, to know *exactly* which habits were completed on which day, we need the logs.
      // Let's see: we can query the logs of each habit! Since `habits` has the list of habits, and each habit's logs can be queried,
      // or we can just fetch logs.
      // Wait, let's write a quick fetch in `habitsService` to get logs!
      // Wait, let's check if we can query `/analytics`? The `/analytics` response contains `charts.completionTrend`, which has counts.
      // To get the exact list of completed habit IDs for a day, we can query each habit's logs or query the analytics,
      // or we can make a direct call to the backend to get logs.
      // Let's think: since a user has a few habits (typically 3-10), we can fetch all logs by calling `/habits/{id}/logs` for each habit,
      // or we can just fetch the journal and log completions.
      // Wait! Is there an easier way?
      // Let's check: in `backend/app/routers/habits.py`, we have:
      // `GET /habits/{id}/logs` -> returns logs for a habit.
      // Also, in `backend/app/routers/habits.py`, we have:
      // `GET /habits` -> returns all habits with stats, and it computes `isCompletedToday` based on today's date!
      // For any arbitrary clicked date, we want to know which habits were completed on *that* date.
      // To do this, we can fetch all logs for all habits.
      // Let's write a React Query that fetches logs for all habits, or simply fetch them in parallel!
      // Actually, fetching them in parallel using `useQueries` or a simple `Promise.all` in a single query is extremely elegant!
      // Let's see:
      // `queryFn: async () => { ... }`
      // We can do:
      // ```typescript
      // queryFn: async () => {
      //   const habitsList = await habitsService.getHabits();
      //   const logsPromises = habitsList.map(h => habitsService.getHabitLogs(h.id));
      //   const logsResults = await Promise.all(logsPromises);
      //   // Combine them into a map of date -> list of completed habit IDs
      //   ...
      // }
      // ```
      // This is incredibly elegant, clean, and requires ZERO changes to the backend!
      return await habitsService.getHabits().then(async (list) => {
        const result: Record<string, { completed: any[]; missed: any[] }> = {};
        
        await Promise.all(
          list.map(async (h) => {
            const logs = await habitsService.getHabitLogs(h.id);
            logs.forEach((log) => {
              if (log.completed) {
                if (!result[log.date]) result[log.date] = { completed: [], missed: [] };
                result[log.date].completed.push(h);
              }
            });
          })
        );
        
        return result;
      });
    }
  });

  // Fetch journal entry for selected date
  const { data: journalEntry, isLoading: journalLoading } = useQuery({
    queryKey: ['journal', selectedDate],
    queryFn: () => journalService.getJournalByDate(selectedDate).catch(() => null), // Catch 404 and return null
    retry: false,
  });

  // Calculate days in selected month
  const numDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

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

  const selectDate = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    // Offset timezone
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISODate = new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
    setSelectedDate(localISODate);
  };

  // Calendar rendering helper
  const renderCalendarCells = () => {
    const cells = [];
    // Empty padding cells
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="aspect-square opacity-0"></div>);
    }

    for (let day = 1; day <= numDays; day++) {
      const cellDate = new Date(currentYear, currentMonth, day);
      const tzOffset = cellDate.getTimezoneOffset() * 60000;
      const cellDateStr = new Date(cellDate.getTime() - tzOffset).toISOString().split('T')[0];
      
      const isSelected = cellDateStr === selectedDate;
      const isToday = cellDateStr === new Date().toISOString().split('T')[0];
      
      // Determine if there are completions on this day
      const dayData = allLogs ? allLogs[cellDateStr] : null;
      const hasCompletions = dayData && dayData.completed.length > 0;

      cells.push(
        <button
          key={`day-${day}`}
          onClick={() => selectDate(day)}
          className={`aspect-square rounded-xl flex flex-col items-center justify-center relative border text-xs font-semibold transition-all select-none hover:bg-white/5 active:scale-95 ${
            isSelected
              ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-105'
              : isToday
              ? 'bg-primary/10 text-primary-light border-primary/25'
              : 'bg-slate-950/20 text-slate-300 border-white/5'
          }`}
        >
          <span>{day}</span>
          {hasCompletions && !isSelected && (
            <span className="absolute bottom-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
          )}
        </button>
      );
    }

    return cells;
  };

  // Compute completed and missed lists for the selected date
  const getSelectedDayDetails = () => {
    if (habitsLoading || !habits) return { completed: [], missed: [] };
    
    const dayData = allLogs ? allLogs[selectedDate] : null;
    const completed = dayData ? dayData.completed : [];
    const completedIds = new Set(completed.map((h) => h.id));
    
    // Missed = habits active on or before selectedDate, but not in completedIds
    
    const missed = habits.filter((h) => {
      const createdDate = new Date(h.createdAt);
      // Remove time part
      createdDate.setHours(0, 0, 0, 0);
      const testDate = new Date(selectedDate);
      testDate.setHours(0, 0, 0, 0);
      
      return createdDate <= testDate && !completedIds.has(h.id);
    });

    return { completed, missed };
  };

  const { completed: completedHabits, missed: missedHabits } = getSelectedDayDetails();
  const formattedSelectedDate = new Date(selectedDate).toLocaleDateString('default', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">Calendar Tracker</h1>
        <p className="text-slate-400 text-xs mt-1">Review past days, track completion history, and check daily diary notes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Calendar Grid (7 cols) */}
        <GlassCard className="lg:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <CalendarIcon className="w-4.5 h-4.5 text-primary-light" /> Interactive Calendar
            </h3>

            {/* Month selectors */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-300 w-28 text-center uppercase tracking-wider">
                {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-2.5 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3.5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w, idx) => (
              <div key={idx}>{w}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2.5">
            {renderCalendarCells()}
          </div>
        </GlassCard>

        {/* Right Column: Day Details (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          <GlassCard className="border border-white/10 relative overflow-hidden">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Day Overview</h3>
            <p className="text-sm font-extrabold text-slate-100 mb-6">{formattedSelectedDate}</p>

            <div className="space-y-6">
              {/* Completed Habits */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Completed ({completedHabits.length})
                </h4>
                {completedHabits.length === 0 ? (
                  <p className="text-2xs text-slate-500 italic pl-6">No habits completed on this day.</p>
                ) : (
                  <div className="space-y-2 pl-6">
                    {completedHabits.map((habit: any) => (
                      <div key={habit.id} className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                        <span className="text-sm">{habit.icon}</span>
                        <span>{habit.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Missed Habits */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-slate-500" /> Missed ({missedHabits.length})
                </h4>
                {missedHabits.length === 0 ? (
                  <p className="text-2xs text-slate-500 italic pl-6">No missed habits on this day.</p>
                ) : (
                  <div className="space-y-2 pl-6">
                    {missedHabits.map((habit: any) => (
                      <div key={habit.id} className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                        <span className="text-sm opacity-55">{habit.icon}</span>
                        <span className="line-through opacity-55">{habit.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Daily Diary Entry */}
              <div className="pt-4 border-t border-white/5">
                <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-accent-light" /> Daily Diary Note
                </h4>

                {journalLoading ? (
                  <div className="h-10 bg-slate-800/30 rounded-xl animate-pulse pl-6"></div>
                ) : journalEntry ? (
                  <div className="space-y-3 pl-6">
                    <div
                      className="text-xs text-slate-300 leading-relaxed max-h-28 overflow-y-auto pr-2 border-l-2 border-accent-dark/35 pl-3"
                      dangerouslySetInnerHTML={{ __html: journalEntry.content }}
                    />
                    <Button
                      variant="glass"
                      size="xs"
                      onClick={() => navigate('/journal', { state: { date: selectedDate } })}
                      className="text-2xs py-1.5 px-3"
                    >
                      <Edit2 className="w-3 h-3 mr-1" /> Edit Note
                    </Button>
                  </div>
                ) : (
                  <div className="pl-6 space-y-2">
                    <p className="text-2xs text-slate-500 italic">No diary notes written for this day.</p>
                    <Button
                      variant="glass"
                      size="xs"
                      onClick={() => navigate('/journal', { state: { date: selectedDate } })}
                      className="text-2xs py-1.5 px-3"
                    >
                      <FileText className="w-3 h-3 mr-1" /> Write Diary Note
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
export default CalendarPage;
