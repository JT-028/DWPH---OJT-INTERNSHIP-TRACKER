import axios from 'axios';
import type {
    InternSettings, DailyLog, InternProgress, ReportData, Holiday,
    AuthResponse, LoginCredentials, RegisterData, User, UserProgress
} from '@/types';

// Use environment variable for API base URL, fallback to local proxy in development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Axios interceptor to attach JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Axios interceptor to handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            // Only redirect if not already on auth pages
            if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const { data } = await api.post('/auth/login', credentials);
        return data;
    },

    register: async (userData: RegisterData): Promise<AuthResponse> => {
        const { data } = await api.post('/auth/register', userData);
        return data;
    },

    me: async (): Promise<User> => {
        const { data } = await api.get('/auth/me');
        return data;
    },
};

// Admin API
export const adminApi = {
    getUsers: async (): Promise<User[]> => {
        const { data } = await api.get('/admin/users');
        return data;
    },

    createSubAdmin: async (userData: RegisterData): Promise<User> => {
        const { data } = await api.post('/admin/users/sub-admin', userData);
        return data;
    },

    updateUser: async (id: string, updates: { isActive?: boolean }): Promise<User> => {
        const { data } = await api.put(`/admin/users/${id}`, updates);
        return data;
    },

    updateUserRole: async (id: string, role: string): Promise<User> => {
        const { data } = await api.put(`/admin/users/${id}/role`, { role });
        return data;
    },

    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/admin/users/${id}`);
    },

    getUserProgress: async (id: string): Promise<UserProgress> => {
        const { data } = await api.get(`/admin/users/${id}/progress`);
        return data;
    },
};

// Settings API
export const settingsApi = {
    get: async (): Promise<InternSettings> => {
        const { data } = await api.get('/settings');
        return data;
    },

    update: async (settings: Partial<InternSettings>): Promise<InternSettings> => {
        const { data } = await api.put('/settings', settings);
        return data;
    },

    reset: async (): Promise<InternSettings> => {
        const { data } = await api.delete('/settings');
        return data;
    },
};

// Daily Logs API
export const logsApi = {
    getAll: async (): Promise<DailyLog[]> => {
        const { data } = await api.get('/logs');
        return data;
    },

    getByDate: async (date: string): Promise<DailyLog | null> => {
        try {
            const { data } = await api.get(`/logs/${date}`);
            return data;
        } catch {
            return null;
        }
    },

    save: async (log: Partial<DailyLog>): Promise<DailyLog> => {
        const { data } = await api.post('/logs', log);
        return data;
    },

    delete: async (date: string): Promise<void> => {
        await api.delete(`/logs/${date}`);
    },

    deleteAll: async (): Promise<void> => {
        await api.delete('/logs');
    },
};

// Progress API
export const progressApi = {
    get: async (): Promise<InternProgress> => {
        const { data } = await api.get('/progress');
        return data;
    },
};

// Reports API
export const reportsApi = {
    getData: async (): Promise<ReportData> => {
        const { data } = await api.get('/reports/data');
        return data;
    },

    getHolidays: async (year: number): Promise<Holiday[]> => {
        const { data } = await api.get(`/reports/holidays/${year}`);
        return data;
    },

    getAllHolidays: async (): Promise<Holiday[]> => {
        const { data } = await api.get('/reports/holidays/all');
        return data;
    },
};

export default api;
