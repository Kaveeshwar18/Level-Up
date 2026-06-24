import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Target,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import goalsService from '../services/goals';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Goals: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any | null>(null);

  // Fetch goals
  const { data: goals, isLoading, error } = useQuery({
    queryKey: ['goals'],
    queryFn: goalsService.getGoals,
  });

  // Mutations
  const createGoalMutation = useMutation({
    mutationFn: goalsService.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setIsCreateModalOpen(false);
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => goalsService.updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setEditingGoal(null);
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: goalsService.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800/50 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-slate-800/50 rounded-2xl border border-white/5"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !goals) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Error loading goals.</p>
      </div>
    );
  }

  const handleDeleteGoal = (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteGoalMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">Goal Tracker</h1>
          <p className="text-slate-400 text-xs mt-1">Define core objectives, set milestones, and crush them.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="sm:self-center py-2.5 px-4">
          <Plus className="w-4 h-4" /> Create New Goal
        </Button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-3xl max-w-lg mx-auto bg-slate-950/10">
          <span className="text-4xl">🎯</span>
          <h3 className="text-base font-bold text-slate-200 mt-4">No goals created yet</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-xs mx-auto">
            Setting goals is the first step in turning the invisible into the visible. Define an objective now!
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)} className="mt-5 mx-auto text-xs py-2 px-4">
            <Plus className="w-3.5 h-3.5 mr-1" /> Create Your First Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const isCompleted = goal.progressPercentage >= 100.0;
            return (
              <motion.div
                layout
                key={goal.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className={`relative group border ${
                  isCompleted ? 'border-emerald-500/20 bg-emerald-950/5' : 'border-white/5'
                }`}>
                  {/* Actions overlay */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingGoal(goal)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 border border-transparent hover:border-red-500/25 text-red-400 hover:text-red-300 transition-all"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-3 pr-16">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center border text-lg ${
                        isCompleted ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400' : 'bg-primary/10 border-primary/20 text-primary-light'
                      }`}>
                        <Target className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-200 line-clamp-1">{goal.title}</h3>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" /> Deadline: {goal.deadline}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    {goal.description ? (
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                        {goal.description}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-600 italic leading-relaxed line-clamp-2 min-h-[2.5rem]">
                        No description details.
                      </p>
                    )}

                    {/* Progress details */}
                    <div className="space-y-3 pt-3">
                      <div className="flex items-center justify-between text-2xs font-semibold text-slate-400">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-slate-500" /> Progress: {goal.currentValue} / {goal.targetValue}
                        </span>
                        <span className={`font-bold ${isCompleted ? 'text-emerald-400' : 'text-primary-light'}`}>
                          {goal.progressPercentage}% {isCompleted ? 'Crushed! 🎉' : ''}
                        </span>
                      </div>

                      {/* Progress bar wrapper */}
                      <div className="w-full bg-slate-950 h-3.5 rounded-full p-[2px] overflow-hidden border border-white/5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-400'
                              : 'bg-gradient-to-r from-primary to-accent shadow-inner'
                          }`}
                          style={{ width: `${goal.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Forms */}
      <AnimatePresence>
        {(isCreateModalOpen || editingGoal) && (
          <GoalFormModal
            goal={editingGoal}
            onClose={() => {
              setIsCreateModalOpen(false);
              setEditingGoal(null);
            }}
            onSubmit={(data) => {
              if (editingGoal) {
                updateGoalMutation.mutate({ id: editingGoal.id, data });
              } else {
                createGoalMutation.mutate(data);
              }
            }}
            isLoading={createGoalMutation.isPending || updateGoalMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Goal Form Modal
interface FormProps {
  goal?: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const GoalFormModal: React.FC<FormProps> = ({ goal, onClose, onSubmit, isLoading }) => {
  const [title, setTitle] = useState(goal ? goal.title : '');
  const [description, setDescription] = useState(goal ? goal.description : '');
  const [currentValue, setCurrentValue] = useState(goal ? goal.currentValue : 0);
  const [targetValue, setTargetValue] = useState(goal ? goal.targetValue : 100);
  
  // Format deadline as YYYY-MM-DD
  const [deadline, setDeadline] = useState(
    goal ? goal.deadline : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      currentValue: Number(currentValue),
      targetValue: Number(targetValue),
      deadline,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md glass-card border border-white/15 rounded-3xl p-6 shadow-2xl relative z-10"
      >
        <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-light" />
          {goal ? 'Edit Goal settings' : 'Create New Goal'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Goal Title"
            type="text"
            required
            placeholder="e.g., Lose 10kg, Save $5000, Learn Rust"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
            <textarea
              className="glass-input px-4 py-3 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary/25 resize-none h-20"
              placeholder="What are the details or action steps for this goal?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Current Value"
              type="number"
              min={0}
              step="any"
              required
              value={currentValue}
              onChange={(e) => setCurrentValue(Number(e.target.value))}
            />

            <Input
              label="Target Value"
              type="number"
              min={0.1}
              step="any"
              required
              value={targetValue}
              onChange={(e) => setTargetValue(Number(e.target.value))}
            />
          </div>

          <Input
            label="Deadline Date"
            type="date"
            required
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading} className="py-2.5 px-4">
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} variant="accent" className="py-2.5 px-5">
              {goal ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
export default Goals;
