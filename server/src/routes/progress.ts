import { Router, Request, Response } from 'express';
import DailyLog from '../models/DailyLog.js';
import Settings from '../models/Settings.js';
import { isHoliday } from '../utils/holidays.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All progress routes require authentication
router.use(authenticate);

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

// Helper function to count valid working days in a period
const countWorkingDays = (
    startDate: Date,
    endDate: Date,
    workDays: number[],
    excludeHolidays: boolean
): number => {
    let count = 0;
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    while (current <= end) {
        const dayOfWeek = current.getDay();
        const dateStr = formatDate(current);

        if (workDays.includes(dayOfWeek)) {
            if (!excludeHolidays || !isHoliday(dateStr)) {
                count++;
            }
        }

        current.setDate(current.getDate() + 1);
    }

    return count;
};

// Helper to find the projected end date by counting forward from a start date
const findProjectedEndDate = (
    fromDate: Date,
    daysNeeded: number,
    workDays: number[],
    excludeHolidays: boolean
): Date => {
    if (daysNeeded <= 0) {
        return fromDate;
    }

    let workDaysCount = 0;
    const current = new Date(fromDate);
    current.setHours(0, 0, 0, 0);

    // Find the first valid working day if fromDate isn't one
    while (!isValidWorkingDay(current, workDays, excludeHolidays)) {
        current.setDate(current.getDate() + 1);
    }

    while (workDaysCount < daysNeeded) {
        const dayOfWeek = current.getDay();
        const dateStr = formatDate(current);

        if (workDays.includes(dayOfWeek)) {
            if (!excludeHolidays || !isHoliday(dateStr)) {
                workDaysCount++;
                if (workDaysCount >= daysNeeded) {
                    break;
                }
            }
        }

        current.setDate(current.getDate() + 1);
    }

    return current;
};

// Check if a date is a valid working day
const isValidWorkingDay = (date: Date, workDays: number[], excludeHolidays: boolean): boolean => {
    const dayOfWeek = date.getDay();
    const dateStr = formatDate(date);

    if (!workDays.includes(dayOfWeek)) {
        return false;
    }

    if (excludeHolidays && isHoliday(dateStr)) {
        return false;
    }

    return true;
};

// GET /api/progress - Get computed progress for current user
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user!._id;
        const settings = await Settings.findOne({ userId });
        const logs = await DailyLog.find({ userId, status: 'completed' });

        if (!settings) {
            return res.status(404).json({ error: 'Settings not found' });
        }

        const startDate = new Date(settings.startDate);
        startDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalHoursCompleted = logs.reduce((sum, log) => sum + log.hoursWorked, 0);
        const totalDaysCompleted = logs.length;
        const remainingHours = Math.max(0, settings.targetHours - totalHoursCompleted);
        const remainingDays = Math.ceil(remainingHours / settings.hoursPerDay);
        const progressPercentage = Math.min(100, (totalHoursCompleted / settings.targetHours) * 100);

        let projectedEndDate: Date | null = null;
        let projectionDetails = {
            workingDaysFromStart: 0,
            workingDaysUsed: totalDaysCompleted,
            workingDaysRemaining: remainingDays,
            averageHoursPerLoggedDay: totalDaysCompleted > 0
                ? Math.round((totalHoursCompleted / totalDaysCompleted) * 10) / 10
                : settings.hoursPerDay,
            daysAhead: 0,
            daysBehind: 0,
            projectionBasis: 'settings' as 'settings' | 'average',
        };

        if (settings.autoProjection) {
            if (totalDaysCompleted > 0) {
                const avgHoursPerDay = totalHoursCompleted / totalDaysCompleted;
                const projectedRemainingDays = Math.ceil(remainingHours / avgHoursPerDay);
                projectionDetails.projectionBasis = 'average';
                projectionDetails.workingDaysRemaining = projectedRemainingDays;
                projectedEndDate = findProjectedEndDate(today, projectedRemainingDays, settings.workDays, settings.excludeHolidays);
            } else {
                projectedEndDate = findProjectedEndDate(startDate, remainingDays, settings.workDays, settings.excludeHolidays);
            }
        } else {
            projectedEndDate = findProjectedEndDate(today, remainingDays, settings.workDays, settings.excludeHolidays);
        }

        if (startDate <= today) {
            projectionDetails.workingDaysFromStart = countWorkingDays(startDate, today, settings.workDays, settings.excludeHolidays);
            const expectedDaysLogged = projectionDetails.workingDaysFromStart;
            const diff = totalDaysCompleted - expectedDaysLogged;
            if (diff > 0) {
                projectionDetails.daysAhead = diff;
            } else if (diff < 0) {
                projectionDetails.daysBehind = Math.abs(diff);
            }
        }

        res.json({
            totalHoursCompleted,
            totalDaysCompleted,
            remainingHours,
            remainingDays: projectionDetails.workingDaysRemaining,
            progressPercentage: Math.round(progressPercentage * 100) / 100,
            projectedEndDate,
            targetHours: settings.targetHours,
            projectionDetails,
        });
    } catch (error) {
        console.error('Error calculating progress:', error);
        res.status(500).json({ error: 'Failed to calculate progress' });
    }
});

export default router;
