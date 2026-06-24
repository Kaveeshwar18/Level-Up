import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import analyticsService from '../services/analytics';
import { GlassCard } from '../components/ui/GlassCard';

export const Achievements: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.getAnalytics,
  });

  const badgesDefinition = [
    {
      key: 'first_habit',
      title: 'First Step',
      description: 'Created your first atomic habit to initiate the journey.',
      emoji: '🏅',
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      key: 'streak_7',
      title: 'Week of Fire',
      description: 'Achieved a consistent 7-day habit streak.',
      emoji: '🔥',
      gradient: 'from-orange-600 to-amber-400',
    },
    {
      key: 'streak_30',
      title: 'Monthly Master',
      description: 'Achieved an outstanding 30-day habit streak.',
      emoji: '⚡',
      gradient: 'from-purple-600 to-indigo-400',
    },
    {
      key: 'consistency_king',
      title: 'Consistency King',
      description: 'Achieved a legendary 100-day consistency milestone.',
      emoji: '👑',
      gradient: 'from-yellow-500 to-amber-500',
    },
    {
      key: 'goal_crusher',
      title: 'Goal Crusher',
      description: 'Successfully reached 100% target progress on any goal.',
      emoji: '🎯',
      gradient: 'from-emerald-600 to-teal-400',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800/50 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-800/50 rounded-2xl border border-white/5"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Error loading achievements.</p>
      </div>
    );
  }

  const { achievements } = data;
  
  // Build a set of earned badge keys for instant check
  const earnedSet = new Set(achievements.map((a: any) => a.badge));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-slate-900 via-yellow-500/5 to-slate-900 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="max-w-xl">
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
            Gamified System
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 mt-4 tracking-tight">
            Trophy Shelf & Badges
          </h1>
          <p className="text-slate-400 text-xs mt-2 leading-relaxed font-medium">
            Unlock achievements by maintaining high streaks, creating habits, and crushing your life goals. Can you collect them all?
          </p>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <GlassCard className="text-center py-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unlocked Badges</p>
          <p className="text-2xl font-extrabold text-slate-200 mt-1.5">
            {earnedSet.size} / {badgesDefinition.length}
          </p>
        </GlassCard>
        <GlassCard className="text-center py-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completion Rate</p>
          <p className="text-2xl font-extrabold text-yellow-400 mt-1.5">
            {Math.round((earnedSet.size / badgesDefinition.length) * 100)}%
          </p>
        </GlassCard>
      </div>

      {/* Badges Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badgesDefinition.map((badge, index) => {
          const isUnlocked = earnedSet.has(badge.key);
          const earnedInfo = achievements.find((a: any) => a.badge === badge.key);
          const dateEarned = earnedInfo
            ? new Date(earnedInfo.earnedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : null;

          return (
            <motion.div
              key={badge.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <GlassCard
                className={`relative overflow-hidden border flex flex-col justify-between h-full group ${
                  isUnlocked
                    ? 'border-yellow-500/10 bg-gradient-to-b from-slate-900 to-yellow-500/5 hover:border-yellow-500/30'
                    : 'border-white/5 opacity-60'
                }`}
              >
                {/* Decorative glow on hover for unlocked */}
                {isUnlocked && (
                  <div className="absolute -right-12 -top-12 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
                )}

                <div className="space-y-4">
                  {/* Badge Emblem */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xl border relative ${
                        isUnlocked
                          ? `bg-gradient-to-br ${badge.gradient} border-white/20 text-white`
                          : 'bg-slate-950 border-white/5 text-slate-600'
                      }`}
                    >
                      {badge.emoji}
                      {!isUnlocked && (
                        <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center">
                          <Lock className="w-2.5 h-2.5 text-slate-500" />
                        </div>
                      )}
                    </div>

                    {isUnlocked && (
                      <span className="text-[9px] font-extrabold uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Unlocked
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className={`text-sm font-bold mt-2 ${isUnlocked ? 'text-slate-100' : 'text-slate-400'}`}>
                      {badge.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed min-h-[3rem]">
                      {badge.description}
                    </p>
                  </div>
                </div>

                {/* Footer Earned Date info */}
                <div className="mt-6 pt-3.5 border-t border-white/5 text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  {isUnlocked ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Unlocked on {dateEarned}</span>
                    </>
                  ) : (
                    <span>Locked</span>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
export default Achievements;
