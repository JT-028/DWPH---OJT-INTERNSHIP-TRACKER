import axios from 'axios';
import type { InternSettings, DailyLog, InternProgress, ReportData } from '@/types';

const api = axios.create({
    baseURL: '/api',
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

    getHolidays: async (year: number): Promise<{ date: string; name: string; type: string }[]> => {
        const { data } = await api.get(`/reports/holidays/${year}`);
        return data;
    },
};

export default api;
