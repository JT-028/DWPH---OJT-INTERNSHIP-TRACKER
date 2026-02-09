import { Router, Request, Response } from 'express';
import DailyLog from '../models/DailyLog.js';
import Settings from '../models/Settings.js';
import { isHoliday } from '../utils/holidays.js';

const router = Router();

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

// Helper function to calculate working days between dates
const calculateWorkingDays = (
    startDate: Date,
    endDate: Date,
    workDays: number[],
    excludeHolidays: boolean
): number => {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
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

// GET /api/progress - Get computed progress
router.get('/', async (_req: Request, res: Response) => {
    try {
        const settings = await Settings.findOne();
        const logs = await DailyLog.find({ status: 'completed' });

        if (!settings) {
            return res.status(404).json({ error: 'Settings not found' });
        }

        // Calculate total hours completed
        const totalHoursCompleted = logs.reduce((sum, log) => sum + log.hoursWorked, 0);
        const totalDaysCompleted = logs.length;

        // Calculate remaining
        const remainingHours = Math.max(0, settings.targetHours - totalHoursCompleted);
        const remainingDays = Math.ceil(remainingHours / settings.hoursPerDay);

        // Calculate progress percentage
        const progressPercentage = Math.min(100, (totalHoursCompleted / settings.targetHours) * 100);

        // Calculate projected end date
        let projectedEndDate: Date | null = null;

        if (remainingDays > 0) {
            const today = new Date();
            let workDaysCount = 0;
            const current = new Date(today);

            while (workDaysCount < remainingDays) {
                const dayOfWeek = current.getDay();
                const dateStr = formatDate(current);

                if (settings.workDays.includes(dayOfWeek)) {
                    if (!settings.excludeHolidays || !isHoliday(dateStr)) {
                        workDaysCount++;
                    }
                }

                if (workDaysCount < remainingDays) {
                    current.setDate(current.getDate() + 1);
                }
            }

            projectedEndDate = current;
        }

        res.json({
            totalHoursCompleted,
            totalDaysCompleted,
            remainingHours,
            remainingDays,
            progressPercentage: Math.round(progressPercentage * 100) / 100,
            projectedEndDate,
            targetHours: settings.targetHours,
        });
    } catch (error) {
        console.error('Error calculating progress:', error);
        res.status(500).json({ error: 'Failed to calculate progress' });
    }
});

export default router;
