import api from './api';
import type { Journal } from '../types';

export const journalService = {
  getJournals: async (): Promise<Journal[]> => {
    const response = await api.get<Journal[]>('/journal');
    return response.data;
  },
  
  getJournalByDate: async (date: string): Promise<Journal> => {
    const response = await api.get<Journal>(`/journal/date/${date}`);
    return response.data;
  },
  
  createOrUpdateJournal: async (data: { date: string; content: string }): Promise<Journal> => {
    const response = await api.post<Journal>('/journal', data);
    return response.data;
  },
  
  deleteJournal: async (id: string): Promise<void> => {
    await api.delete(`/journal/${id}`);
  }
};
export default journalService;
