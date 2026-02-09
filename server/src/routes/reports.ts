import { Router, Request, Response } from 'express';
import DailyLog from '../models/DailyLog.js';
import Settings from '../models/Settings.js';
import { getHolidaysForYear } from '../utils/holidays.js';

const router = Router();

// GET /api/reports/data - Get all data for report generation
router.get('/data', async (_req: Request, res: Response) => {
    try {
        const settings = await Settings.findOne();
        const logs = await DailyLog.find().sort({ date: 1 });

        if (!settings) {
            return res.status(404).json({ error: 'Settings not found' });
        }

        // Calculate totals
        const completedLogs = logs.filter((log) => log.status === 'completed');
        const totalHoursCompleted = completedLogs.reduce((sum, log) => sum + log.hoursWorked, 0);
        const totalDaysCompleted = completedLogs.length;
        const remainingHours = Math.max(0, settings.targetHours - totalHoursCompleted);
        const progressPercentage = Math.min(100, (totalHoursCompleted / settings.targetHours) * 100);

        res.json({
            settings: {
                targetHours: settings.targetHours,
                startDate: settings.startDate,
                hoursPerDay: settings.hoursPerDay,
                excludeHolidays: settings.excludeHolidays,
                workDays: settings.workDays,
            },
            logs: logs.map((log) => ({
                date: log.date,
                hoursWorked: log.hoursWorked,
                tasks: log.tasks,
                status: log.status,
            })),
            summary: {
                totalHoursCompleted,
                totalDaysCompleted,
                remainingHours,
                progressPercentage: Math.round(progressPercentage * 100) / 100,
            },
        });
    } catch (error) {
        console.error('Error generating report data:', error);
        res.status(500).json({ error: 'Failed to generate report data' });
    }
});

// GET /api/reports/holidays/all - Get all available holidays
router.get('/holidays/all', async (_req: Request, res: Response) => {
    try {
        const { getAllHolidays } = await import('../utils/holidays.js');
        const holidays = getAllHolidays();
        res.json(holidays);
    } catch (error) {
        console.error('Error fetching all holidays:', error);
        res.status(500).json({ error: 'Failed to fetch all holidays' });
    }
});

// GET /api/reports/holidays/:year - Get holidays for a specific year
router.get('/holidays/:year', async (req: Request, res: Response) => {
    try {
        const year = parseInt(req.params.year, 10);

        if (isNaN(year) || year < 2026) {
            return res.status(400).json({ error: 'Invalid year. Must be 2026 or later.' });
        }

        const holidays = getHolidaysForYear(year);
        res.json(holidays);
    } catch (error) {
        console.error('Error fetching holidays:', error);
        res.status(500).json({ error: 'Failed to fetch holidays' });
    }
});

export default router;
