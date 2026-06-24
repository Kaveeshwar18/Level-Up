import api from './api';
import type { Habit, HabitLog } from '../types';

export const habitsService = {
  getHabits: async (): Promise<Habit[]> => {
    const response = await api.get<Habit[]>('/habits');
    return response.data;
  },
  
  getHabitById: async (id: string): Promise<Habit> => {
    const response = await api.get<Habit>(`/habits/${id}`);
    return response.data;
  },
  
  createHabit: async (data: any): Promise<Habit> => {
    const response = await api.post<Habit>('/habits', data);
    return response.data;
  },
  
  updateHabit: async (id: string, data: any): Promise<Habit> => {
    const response = await api.put<Habit>(`/habits/${id}`, data);
    return response.data;
  },
  
  deleteHabit: async (id: string): Promise<void> => {
    await api.delete(`/habits/${id}`);
  },
  
  logHabit: async (id: string, date: string, completed: boolean): Promise<Habit> => {
    const response = await api.post<Habit>(`/habits/${id}/log`, { date, completed });
    return response.data;
  },
  
  getHabitLogs: async (id: string): Promise<HabitLog[]> => {
    const response = await api.get<HabitLog[]>(`/habits/${id}/logs`);
    return response.data;
  }
};
export default habitsService;
