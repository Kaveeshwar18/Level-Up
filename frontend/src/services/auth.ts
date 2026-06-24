import api from './api';
import type { User } from '../types';

export const authService = {
  register: async (data: any): Promise<User> => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },
  
  login: async (data: any): Promise<{ access_token: string; token_type: string }> => {
    const response = await api.post<{ access_token: string; token_type: string }>('/auth/login', data);
    return response.data;
  },
  
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
  
  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<User>('/auth/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  uploadAvatarBase64: async (avatarBase64: string): Promise<User> => {
    const response = await api.post<User>('/auth/me/avatar-base64', { avatar: avatarBase64 });
    return response.data;
  }
};
export default authService;
