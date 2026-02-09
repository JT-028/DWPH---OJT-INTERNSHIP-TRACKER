export type LogStatus = 'scheduled' | 'completed' | 'holiday' | 'off';

export interface InternSettings {
    _id?: string;
    targetHours: number;
    startDate: string;
    hoursPerDay: number;
    excludeHolidays: boolean;
    workDays: number[];
    autoProjection: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface DailyLog {
    _id?: string;
    date: string;
    hoursWorked: number;
    tasks: string;
    status: LogStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface InternProgress {
    totalHoursCompleted: number;
    totalDaysCompleted: number;
    remainingHours: number;
    remainingDays: number;
    progressPercentage: number;
    projectedEndDate: string | null;
    targetHours: number;
}

export interface Holiday {
    date: string;
    name: string;
    type: 'regular' | 'special';
}

export interface ReportData {
    settings: Omit<InternSettings, '_id' | 'createdAt' | 'updatedAt'>;
    logs: Omit<DailyLog, '_id' | 'createdAt' | 'updatedAt'>[];
    summary: {
        totalHoursCompleted: number;
        totalDaysCompleted: number;
        remainingHours: number;
        progressPercentage: number;
    };
}

export interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    isWorkday: boolean;
    isHoliday: boolean;
    holidayName?: string;
    log?: DailyLog;
}
