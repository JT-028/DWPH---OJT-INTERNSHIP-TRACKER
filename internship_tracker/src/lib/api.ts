import axios from 'axios';
import type {
    InternSettings, DailyLog, InternProgress, ReportData, Holiday,
    AuthResponse, LoginCredentials, RegisterData, User, UserProgress,
    InternReportData
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

    // New: Get available supervisors (sub-admins and admins)
    getSupervisors: async (): Promise<User[]> => {
        const { data } = await api.get('/admin/supervisors');
        return data;
    },

    // New: Assign supervisors to an intern
    assignSupervisors: async (internId: string, supervisorIds: string[]): Promise<User> => {
        const { data } = await api.put(`/admin/users/${internId}/supervisors`, { supervisorIds });
        return data;
    },

    // New: Get all logs for a specific intern
    getInternLogs: async (internId: string): Promise<{ user: User; logs: DailyLog[] }> => {
        const { data } = await api.get(`/admin/users/${internId}/logs`);
        return data;
    },

    // New: Get a specific log by date for an intern
    getInternLogByDate: async (internId: string, date: string): Promise<DailyLog> => {
        const { data } = await api.get(`/admin/users/${internId}/logs/${date}`);
        return data;
    },

    // New: Get pending (unvalidated) logs for an intern
    getPendingLogs: async (internId: string): Promise<DailyLog[]> => {
        const { data } = await api.get(`/admin/users/${internId}/logs-pending`);
        return data;
    },

    // New: Validate a log
    validateLog: async (internId: string, date: string, notes?: string): Promise<DailyLog> => {
        const { data } = await api.put(`/admin/users/${internId}/logs/${date}/validate`, { notes });
        return data;
    },

    // New: Invalidate a log (remove validation)
    invalidateLog: async (internId: string, date: string, reason?: string): Promise<DailyLog> => {
        const { data } = await api.put(`/admin/users/${internId}/logs/${date}/invalidate`, { reason });
        return data;
    },

    // New: Bulk validate multiple logs
    validateLogsBulk: async (internId: string, dates: string[], notes?: string): Promise<{ results: { date: string; success: boolean; error?: string }[] }> => {
        const { data } = await api.put(`/admin/users/${internId}/logs/validate-bulk`, { dates, notes });
        return data;
    },

    // New: Mark a date as special workday (weekend/holiday work)
    markSpecialWorkday: async (
        internId: string,
        date: string,
        options?: { reason?: string; hoursWorked?: number; tasks?: string }
    ): Promise<DailyLog> => {
        const { data } = await api.put(`/admin/users/${internId}/logs/${date}/special-workday`, options || {});
        return data;
    },

    // New: Remove special workday status
    removeSpecialWorkday: async (internId: string, date: string): Promise<DailyLog> => {
        const { data } = await api.put(`/admin/users/${internId}/logs/${date}/remove-special-workday`);
        return data;
    },

    // Reports API
    // Get full report data for a specific intern
    getInternReport: async (internId: string): Promise<InternReportData> => {
        const { data } = await api.get(`/admin/reports/intern/${internId}`);
        return data;
    },

    // Get bulk report data for multiple interns
    getBulkReport: async (internIds?: string[]): Promise<InternReportData[]> => {
        const params = internIds ? `?ids=${internIds.join(',')}` : '';
        const { data } = await api.get(`/admin/reports/bulk${params}`);
        return data;
    },

    // Download PDF for single intern (returns blob URL)
    downloadInternPDF: async (internId: string): Promise<Blob> => {
        const response = await api.get(`/admin/reports/intern/${internId}/download`, {
            responseType: 'blob',
        });
        return response.data;
    },

    // Download bulk PDF for multiple interns (returns blob URL)
    downloadBulkPDF: async (internIds?: string[]): Promise<Blob> => {
        const params = internIds ? `?ids=${internIds.join(',')}` : '';
        const response = await api.get(`/admin/reports/bulk/download${params}`, {
            responseType: 'blob',
        });
        return response.data;
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
