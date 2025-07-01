import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autorização automaticamente
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autorização
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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
  collaborator_id?: number;
  collaborator_name?: string;
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
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
  changePassword: async (data: any) => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },
};

// Classes API
export const classesAPI = {
  getAll: async () => {
    const response = await api.get('/classes');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },
  getStudents: async (id: number) => {
    const response = await api.get(`/classes/${id}/students`);
    return response.data;
  },
  create: async (data: { name: string; description: string }) => {
    const response = await api.post('/classes', data);
    return response.data;
  },
  join: async (code: string) => {
    const response = await api.post('/classes/join', { code });
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/classes/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },
  regenerateCode: async (id: number) => {
    const response = await api.post(`/classes/${id}/regenerate-code`);
    return response.data;
  },
  addCollaborator: async (id: number, data: { collaborator_email: string }) => {
    const response = await api.post(`/classes/${id}/collaborator`, data);
    return response.data;
  },
  removeCollaborator: async (id: number, data: { collaborator_id: number }) => {
    const response = await api.delete(`/classes/${id}/collaborator`, { data });
    return response.data;
  },
};

// Content API
export const contentAPI = {
  getAll: async (classId?: number) => {
    const url = classId ? `/content?class_id=${classId}` : '/content';
    const response = await api.get(url);
    return response.data;
  },
  getByClass: async (classId: number) => {
    const response = await api.get(`/content?class_id=${classId}`);
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/content/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/content', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/content/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/content/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/content/stats');
    return response.data;
  },
};

// Activities API
export const activitiesAPI = {
  getAll: async (classId?: number) => {
    const url = classId ? `/activities?class_id=${classId}` : '/activities';
    const response = await api.get(url);
    return response.data;
  },
  getByClass: async (classId: number) => {
    const response = await api.get(`/activities/class/${classId}`);
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/activities', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/activities/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  },
};

// Notes API
export const notesAPI = {
  getAll: async (classId?: number, contentId?: number) => {
    let url = '/notes';
    const params = new URLSearchParams();
    if (classId) params.append('class_id', classId.toString());
    if (contentId) params.append('content_id', contentId.toString());
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },
  getByClass: async (classId: number) => {
    const response = await api.get(`/notes?class_id=${classId}`);
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },
  create: async (data: { title: string; content: string; class_id?: number; content_id?: number }) => {
    const response = await api.post('/notes', data);
    return response.data;
  },
  update: async (id: number, data: { title: string; content: string }) => {
    const response = await api.put(`/notes/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },
};

// Notifications API
export const notificationAPI = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },
  markAsRead: async (id: number) => {
    const response = await api.put(`/notifications/${id}/read`, {});
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all', {});
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

// Progress API
export const progressAPI = {
  getByUser: async () => {
    const response = await api.get('/progress');
    return response.data;
  },
  update: async (contentId: number, data: { completed: boolean; progress_percentage: number }) => {
    const response = await api.put(`/progress/${contentId}`, data);
    return response.data;
  },
};

// Feedback API
export const feedbackAPI = {
  create: async (data: { name: string; email: string; subject: string; message: string; }) => {
    const response = await api.post('/feedback', data);
    return response.data;
  },
}; 