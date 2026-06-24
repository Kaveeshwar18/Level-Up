import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Coins,
  Trash2,
  Calendar,
  PieChart as PieIcon,
  Tag,
  Settings
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import expensesService from '../services/expenses';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Expenses: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customBudget, setCustomBudget] = useState(1500.0);
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  // Fetch transactions list
  const { data: expenses, isLoading: listLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: expensesService.getExpenses,
  });

  // Fetch stats (spending calculations)
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['expense-stats', customBudget],
    queryFn: () => expensesService.getStats(customBudget),
  });

  // Mutations
  const createExpenseMutation = useMutation({
    mutationFn: expensesService.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-stats'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setIsAddModalOpen(false);
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: expensesService.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-stats'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  if (listLoading || statsLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800/50 rounded-xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-slate-800/50 rounded-2xl border border-white/5"></div>
          <div className="h-96 bg-slate-800/50 rounded-2xl border border-white/5 lg:col-span-2"></div>
        </div>
      </div>
    );
  }

  const handleDeleteExpense = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteExpenseMutation.mutate(id);
    }
  };

  const COLORS = ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];

  // Custom tooltips
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-2.5 border border-white/10 rounded-xl text-2xs shadow-2xl backdrop-blur-md text-slate-200">
          <p className="font-bold">{payload[0].name}</p>
          <p className="text-accent-light font-bold mt-0.5">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">Expense Tracker</h1>
          <p className="text-slate-400 text-xs mt-1">Audit transactions, log spending, and monitor monthly budgets.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="sm:self-center py-2.5 px-4">
          <Plus className="w-4 h-4" /> Add Transaction
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Stats Capsule & Budget setting (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          <GlassCard className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Spending Summary</h3>
              <button
                onClick={() => setIsEditingBudget(!isEditingBudget)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                title="Edit Budget Limit"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Budget Editing Inline Panel */}
            {isEditingBudget && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 space-y-3"
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Adjust Monthly Budget ($)</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customBudget}
                    onChange={(e) => setCustomBudget(Number(e.target.value))}
                    className="flex-1 glass-input px-3 py-1.5 rounded-lg text-xs bg-slate-900"
                  />
                  <Button size="xs" variant="primary" onClick={() => setIsEditingBudget(false)} className="py-1 px-3">
                    Save
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Budget Values */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Today's Total</p>
                  <p className="text-2xl font-extrabold text-slate-100 mt-1">${stats?.todaySpending.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold text-right uppercase tracking-wider">This Month</p>
                  <p className="text-2xl font-extrabold text-slate-100 mt-1">${stats?.monthlySpending.toFixed(2)}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2 pt-3">
                <div className="flex items-center justify-between text-2xs font-semibold text-slate-400">
                  <span>Spend Limit: ${stats?.monthlyBudget}</span>
                  <span className={stats && stats.budgetRemaining < 200 ? 'text-red-400 font-extrabold' : 'text-slate-300'}>
                    ${stats?.budgetRemaining.toFixed(2)} left
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      stats && stats.monthlySpending >= stats.monthlyBudget
                        ? 'bg-red-500'
                        : stats && stats.monthlySpending > stats.monthlyBudget * 0.8
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-primary to-accent'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        stats ? (stats.monthlySpending / stats.monthlyBudget) * 100 : 0
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Categories Pie Chart */}
          <GlassCard>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-accent" /> Categories Share
            </h3>

            {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
              <div className="h-56 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.categoryBreakdown.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Display center labels if helpful */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Share</span>
                  <span className="text-sm font-extrabold text-slate-300">
                    {stats.categoryBreakdown.length} Categories
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-2xs italic">
                No monthly transactions found. Chart will appear here.
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Side: Scrollable transactions log table (8 cols) */}
        <div className="lg:col-span-8">
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Transaction History</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Itemized logs of all cash outflows</p>
              </div>
            </div>

            {expenses && expenses.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
                <span className="text-3xl">💸</span>
                <p className="text-xs text-slate-500 mt-3">No expenses logged. Tap 'Add Transaction' to start tracking.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse select-none">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <th className="pb-3.5 pl-2">Category</th>
                      <th className="pb-3.5">Description</th>
                      <th className="pb-3.5">Date</th>
                      <th className="pb-3.5 text-right pr-4">Amount</th>
                      <th className="pb-3.5 text-right w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {expenses?.map((exp) => (
                      <tr key={exp.id} className="group/row hover:bg-white/5 transition-all text-xs font-semibold text-slate-200">
                        <td className="py-3.5 pl-2">
                          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-extrabold text-slate-300">
                            <Tag className="w-3 h-3 text-primary-light" /> {exp.category}
                          </span>
                        </td>
                        <td className="py-3.5 max-w-xs truncate text-slate-300">{exp.description || 'N/A'}</td>
                        <td className="py-3.5 text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" /> {exp.date}
                        </td>
                        <td className="py-3.5 text-right font-extrabold text-slate-100 pr-4">${exp.amount.toFixed(2)}</td>
                        <td className="py-3.5 text-right w-12 pr-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-transparent hover:border-red-500/35 text-red-400 hover:text-red-300 transition-all"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <ExpenseFormModal
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={(data) => createExpenseMutation.mutate(data)}
            isLoading={createExpenseMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Form Modal component
interface FormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const ExpenseFormModal: React.FC<FormProps> = ({ onClose, onSubmit, isLoading }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = [
    'Food & Dining',
    'Transportation',
    'Utilities & Bills',
    'Entertainment',
    'Fitness & Health',
    'Shopping',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      amount: Number(amount),
      category,
      description,
      date,
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

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md glass-card border border-white/15 rounded-3xl p-6 shadow-2xl relative z-10"
      >
        <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
          <Coins className="w-5 h-5 text-accent-light" />
          Log Expense Transaction
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Amount ($)"
            type="number"
            min={0.01}
            step="0.01"
            required
            placeholder="e.g., 24.50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

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
            label="Description / Merchant"
            type="text"
            required
            placeholder="e.g., Whole Foods, Uber Ride, Gas bill"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Input
            label="Transaction Date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading} className="py-2.5 px-4">
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} variant="accent" className="py-2.5 px-5">
              Add Transaction
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
export default Expenses;
