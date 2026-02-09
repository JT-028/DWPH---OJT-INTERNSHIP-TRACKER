import { Router, Request, Response } from 'express';
import DailyLog from '../models/DailyLog.js';

const router = Router();

// GET /api/logs - Get all daily logs
router.get('/', async (_req: Request, res: Response) => {
    try {
        const logs = await DailyLog.find().sort({ date: 1 });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// GET /api/logs/:date - Get log for specific date
router.get('/:date', async (req: Request, res: Response) => {
    try {
        const { date } = req.params;
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const log = await DailyLog.findOne({
            date: { $gte: startOfDay, $lte: endOfDay },
        });

        if (!log) {
            return res.status(404).json({ error: 'Log not found' });
        }

        res.json(log);
    } catch (error) {
        console.error('Error fetching log:', error);
        res.status(500).json({ error: 'Failed to fetch log' });
    }
});

// POST /api/logs - Create or update a daily log
router.post('/', async (req: Request, res: Response) => {
    try {
        const { date, hoursWorked, tasks, status } = req.body;

        const logDate = new Date(date);
        logDate.setHours(0, 0, 0, 0);

        let log = await DailyLog.findOne({
            date: logDate,
        });

        if (log) {
            // Update existing log
            log.hoursWorked = hoursWorked ?? log.hoursWorked;
            log.tasks = tasks ?? log.tasks;
            log.status = status ?? log.status;
            await log.save();
        } else {
            // Create new log
            log = await DailyLog.create({
                date: logDate,
                hoursWorked: hoursWorked ?? 8,
                tasks: tasks ?? '',
                status: status ?? 'scheduled',
            });
        }

        res.json(log);
    } catch (error) {
        console.error('Error saving log:', error);
        res.status(500).json({ error: 'Failed to save log' });
    }
});

// DELETE /api/logs/:date - Delete a log entry
router.delete('/:date', async (req: Request, res: Response) => {
    try {
        const { date } = req.params;
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const result = await DailyLog.deleteOne({
            date: { $gte: startOfDay, $lte: endOfDay },
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Log not found' });
        }

        res.json({ message: 'Log deleted successfully' });
    } catch (error) {
        console.error('Error deleting log:', error);
        res.status(500).json({ error: 'Failed to delete log' });
    }
});

// DELETE /api/logs - Delete all logs (reset)
router.delete('/', async (_req: Request, res: Response) => {
    try {
        await DailyLog.deleteMany({});
        res.json({ message: 'All logs deleted successfully' });
    } catch (error) {
        console.error('Error deleting all logs:', error);
        res.status(500).json({ error: 'Failed to delete logs' });
    }
});

export default router;
