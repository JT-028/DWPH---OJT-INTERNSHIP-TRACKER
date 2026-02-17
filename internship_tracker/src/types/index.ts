export type LogStatus = 'scheduled' | 'completed' | 'holiday' | 'off';
export type UserRole = 'intern' | 'sub-admin' | 'admin';
export type Department = 'Creative & Marketing Support Associates' | 'Recruitment Support Interns' | 'IT Support Interns' | '';

export interface User {
    _id: string;
    email: string;
    name: string;
    role: UserRole;
    department?: Department;
    isActive: boolean;
    supervisors?: string[]; // Array of supervisor user IDs
    createdAt?: string;
    updatedAt?: string;
    // Populated by admin endpoints
    totalHoursCompleted?: number;
    targetHours?: number;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    department?: Department;
}

export interface InternSettings {
    _id?: string;
    userId?: string;
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
    userId?: string;
    date: string;
    hoursWorked: number;
    tasks: string;
    status: LogStatus;
    // Special workday fields (weekends/holidays marked as workday)
    isSpecialWorkday?: boolean;
    specialWorkdayReason?: string;
    markedByAdmin?: string;
    // Validation fields (IS verification)
    isValidated?: boolean;
    validatedBy?: string;
    validatedAt?: string;
    validationNotes?: string;
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

export interface UserProgress {
    user: User;
    progress: {
        totalHoursCompleted: number;
        totalDaysCompleted: number;
        remainingHours: number;
        progressPercentage: number;
        targetHours: number;
    };
    logs: DailyLog[];
}

export interface InternReportData {
    user: {
        _id: string;
        name: string;
        email: string;
        role: UserRole;
        supervisors?: Array<{ _id: string; name: string; email: string }>;
        createdAt?: string;
    };
    settings: {
        targetHours: number;
        startDate: string;
        hoursPerDay: number;
        workDays: number[];
    } | null;
    summary: {
        totalHoursCompleted: number;
        totalDaysCompleted: number;
        totalDaysValidated: number;
        totalSpecialWorkdays: number;
        remainingHours: number;
        progressPercentage: number;
        targetHours: number;
    };
    logs: DailyLog[];
}
