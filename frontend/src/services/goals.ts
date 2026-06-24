import api from './api';
import type { Goal } from '../types';

export const goalsService = {
  getGoals: async (): Promise<Goal[]> => {
    const response = await api.get<Goal[]>('/goals');
    return response.data;
  },
  
  getGoalById: async (id: string): Promise<Goal> => {
    const response = await api.get<Goal>(`/goals/${id}`);
    return response.data;
  },
  
  createGoal: async (data: any): Promise<Goal> => {
    const response = await api.post<Goal>('/goals', data);
    return response.data;
  },
  
  updateGoal: async (id: string, data: any): Promise<Goal> => {
    const response = await api.put<Goal>(`/goals/${id}`, data);
    return response.data;
  },
  
  deleteGoal: async (id: string): Promise<void> => {
    await api.delete(`/goals/${id}`);
  }
};
export default goalsService;
