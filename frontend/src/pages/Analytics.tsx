import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import { BarChart2, TrendingUp, PieChart as PieIcon, Sliders, Activity } from 'lucide-react';
import analyticsService from '../services/analytics';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';

export const Analytics: React.FC = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.getAnalytics,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800/50 rounded-xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-slate-800/50 rounded-2xl border border-white/5"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 font-medium">Failed to load analytics.</p>
        <Button onClick={() => refetch()} className="mt-4 mx-auto">
          Retry
        </Button>
      </div>
    );
  }

  const { charts } = data;

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label, unit = '' }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-white/10 rounded-xl text-2xs shadow-2xl backdrop-blur-md">
          <p className="font-bold text-slate-200">{label}</p>
          <p className="text-primary-light font-bold mt-1">
            {payload[0].name}: {payload[0].value}
            {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  // Pie chart colors
  const COLORS = ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">Analytics Dashboard</h1>
        <p className="text-slate-400 text-xs mt-1">
          Detailed metrics and charts charting your productivity and habit performance.
        </p>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Habit Completion Trend (Line Chart) */}
        <GlassCard>
          <h3 className="text-sm font-bold text-slate-200 mb-6 flex items-center gap-1.5">
            <TrendingUp className="w-4.5 h-4.5 text-primary-light" /> Habit Completion Trend
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.completionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={9} dy={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} dx={-10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="completedCount"
                  name="Completed Habits"
                  stroke="#7C3AED"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* 2. Productivity Score (Area Chart) */}
        <GlassCard>
          <h3 className="text-sm font-bold text-slate-200 mb-6 flex items-center gap-1.5">
            <Activity className="w-4.5 h-4.5 text-accent-light" /> Productivity Score (%)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.productivityScore}>
                <defs>
                  <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={9} dy={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} dx={-10} tickLine={false} />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  name="Productivity"
                  stroke="#06B6D4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#prodGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* 3. Weekly Performance (Bar Chart) */}
        <GlassCard>
          <h3 className="text-sm font-bold text-slate-200 mb-6 flex items-center gap-1.5">
            <BarChart2 className="w-4.5 h-4.5 text-primary-light" /> Weekly Performance
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.weeklyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={9} dy={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} dx={-10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="completedCount"
                  name="Total Completions"
                  fill="#7C3AED"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* 4. Category Breakdown (Pie Chart) */}
        <GlassCard>
          <h3 className="text-sm font-bold text-slate-200 mb-6 flex items-center gap-1.5">
            <PieIcon className="w-4.5 h-4.5 text-accent-light" /> Category Breakdown
          </h3>
          <div className="h-72 w-full flex flex-col sm:flex-row items-center justify-around gap-6">
            <div className="h-56 w-56 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.categoryBreakdown.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="flex flex-col gap-2">
              {charts.categoryBreakdown.map((entry: any, index: number) => (
                <div key={entry.name} className="flex items-center gap-2.5 text-2xs font-semibold text-slate-300 select-none">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>
                    {entry.name}: <strong className="text-slate-100">{entry.value} habit{entry.value !== 1 ? 's' : ''}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* 5. Monthly Growth (Line Chart) */}
        <GlassCard className="lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-200 mb-6 flex items-center gap-1.5">
            <Sliders className="w-4.5 h-4.5 text-primary-light" /> Cumulative Monthly Growth
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={9} dy={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} dx={-10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="completions"
                  name="Monthly Completions"
                  stroke="#10B981"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  dot={{ stroke: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
export default Analytics;
