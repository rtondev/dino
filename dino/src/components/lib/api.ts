import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  user_type: string;
  age?: number;
  institution?: string;
  created_at?: string;
}

export interface Class {
  id: number;
  name: string;
  description: string;
  code: string;
  professor_id: number;
  professor_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: number;
  title: string;
  description: string;
  type: 'video' | 'document' | 'link' | 'activity';
  url?: string;
  file_path?: string;
  class_id: number;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  type: 'quiz' | 'assignment' | 'discussion';
  due_date?: string;
  class_id: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  class_id?: number;
  content_id?: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  user_id: number;
  created_at: string;
}

export interface Progress {
  id: number;
  user_id: number;
  content_id: number;
  completed: boolean;
  progress_percentage: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (data: {
    username: string;
    email: string;
    password: string;
    user_type: string;
    age?: number;
    institution?: string;
    privacy_policy_accepted: boolean;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  updateProfile: async (data: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.put('/profile', data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  changePassword: async (data: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.post('/change-password', data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
};

// Classes API
export const classesAPI = {
  getAll: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.get('/classes', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  getById: async (id: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.get(`/classes/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  create: async (data: { name: string; description: string }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.post('/classes', data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  join: async (code: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.post('/classes/join', { code }, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  update: async (id: number, data: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.put(`/classes/${id}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  delete: async (id: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.delete(`/classes/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
};

// Content API
export const contentAPI = {
  getAll: async (classId?: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const url = classId ? `/content?class_id=${classId}` : '/content';
    const response = await api.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  getById: async (id: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.get(`/content/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  create: async (data: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.post('/content', data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  update: async (id: number, data: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.put(`/content/${id}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  delete: async (id: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.delete(`/content/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  getStats: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.get('/content/stats', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
};

// Activities API
export const activitiesAPI = {
  getAll: async (classId?: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const url = classId ? `/activities?class_id=${classId}` : '/activities';
    const response = await api.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  getById: async (id: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.get(`/activities/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  create: async (data: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.post('/activities', data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  update: async (id: number, data: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.put(`/activities/${id}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  delete: async (id: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.delete(`/activities/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
};

// Notes API
export const notesAPI = {
  getAll: async (classId?: number, contentId?: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let url = '/notes';
    const params = new URLSearchParams();
    if (classId) params.append('class_id', classId.toString());
    if (contentId) params.append('content_id', contentId.toString());
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  getById: async (id: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.get(`/notes/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  create: async (data: { title: string; content: string; class_id?: number; content_id?: number }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.post('/notes', data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  update: async (id: number, data: { title: string; content: string }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.put(`/notes/${id}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  delete: async (id: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.delete(`/notes/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
};

// Notifications API
export const notificationAPI = {
  getAll: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.get('/notifications', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  getUnreadCount: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.get('/notifications/unread-count', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  markAsRead: async (id: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.put(`/notifications/${id}/read`, {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  markAllAsRead: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.put('/notifications/read-all', {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  delete: async (id: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.delete(`/notifications/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
};

// Progress API
export const progressAPI = {
  getByUser: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.get('/progress', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  update: async (contentId: number, data: { completed: boolean; progress_percentage: number }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.put(`/progress/${contentId}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
};

// Feedback API
export const feedbackAPI = {
  create: async (data: { name: string; email: string; subject: string; message: string; }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.post('/feedback', data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
}; 