import api from './api';
import type { DashboardData } from '../types';

export const analyticsService = {
  getAnalytics: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>('/analytics');
    return response.data;
  }
};
export default analyticsService;
