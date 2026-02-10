import { Router, Request, Response } from 'express';
import DailyLog from '../models/DailyLog.js';
import Settings from '../models/Settings.js';
import { getHolidaysForYear, getAllHolidays } from '../utils/holidays.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/reports/data - Get all data for report generation (authenticated)
router.get('/data', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user!._id;
        const settings = await Settings.findOne({ userId });
        const logs = await DailyLog.find({ userId }).sort({ date: 1 });

        if (!settings) {
            return res.status(404).json({ error: 'Settings not found' });
        }

        const completedLogs = logs.filter(l => l.status === 'completed');
        const totalHoursCompleted = completedLogs.reduce((sum, l) => sum + l.hoursWorked, 0);
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
                autoProjection: settings.autoProjection,
            },
            logs: logs.map(l => ({
                date: l.date,
                hoursWorked: l.hoursWorked,
                tasks: l.tasks,
                status: l.status,
            })),
            summary: {
                totalHoursCompleted,
                totalDaysCompleted,
                remainingHours,
                progressPercentage: Math.round(progressPercentage * 100) / 100,
            },
        });
    } catch (error) {
        console.error('Error fetching report data:', error);
        res.status(500).json({ error: 'Failed to fetch report data' });
    }
});

// GET /api/reports/holidays/all - Get all available holidays (public)
router.get('/holidays/all', async (_req: Request, res: Response) => {
    try {
        const holidays = getAllHolidays();
        res.json(holidays);
    } catch (error) {
        console.error('Error fetching all holidays:', error);
        res.status(500).json({ error: 'Failed to fetch all holidays' });
    }
});

// GET /api/reports/holidays/:year - Get holidays for a specific year (public)
router.get('/holidays/:year', async (req: Request, res: Response) => {
    try {
        const year = parseInt(req.params.year);
        if (isNaN(year)) {
            return res.status(400).json({ error: 'Invalid year' });
        }
        const holidays = getHolidaysForYear(year);
        res.json(holidays);
    } catch (error) {
        console.error('Error fetching holidays:', error);
        res.status(500).json({ error: 'Failed to fetch holidays' });
    }
});

export default router;
