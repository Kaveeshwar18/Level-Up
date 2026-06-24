import api from './api';
import type { Expense, SpendingStats } from '../types';

export const expensesService = {
  getExpenses: async (): Promise<Expense[]> => {
    const response = await api.get<Expense[]>('/expenses');
    return response.data;
  },
  
  getExpenseById: async (id: string): Promise<Expense> => {
    const response = await api.get<Expense>(`/expenses/${id}`);
    return response.data;
  },
  
  createExpense: async (data: any): Promise<Expense> => {
    const response = await api.post<Expense>('/expenses', data);
    return response.data;
  },
  
  updateExpense: async (id: string, data: any): Promise<Expense> => {
    const response = await api.put<Expense>(`/expenses/${id}`, data);
    return response.data;
  },
  
  deleteExpense: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
  
  getStats: async (budget: number = 1500.0): Promise<SpendingStats> => {
    const response = await api.get<SpendingStats>(`/expenses/stats?budget=${budget}`);
    return response.data;
  }
};
export default expensesService;
