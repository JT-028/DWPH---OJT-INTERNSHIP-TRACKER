import axios from 'axios';
import type { InternSettings, DailyLog, InternProgress, ReportData, Holiday } from '@/types';

// Use environment variable for API base URL, fallback to local proxy in development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
