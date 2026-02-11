import { Router, Request, Response } from 'express';
import DailyLog from '../models/DailyLog.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All logs routes require authentication
router.use(authenticate);

// GET /api/logs - Get all daily logs for current user
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user!._id;
        const logs = await DailyLog.find({ userId }).sort({ date: 1 });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// GET /api/logs/:date - Get log for specific date for current user
router.get('/:date', async (req: Request, res: Response) => {
    try {
        const userId = req.user!._id;
        const { date } = req.params;
        
        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }
        
        const dateStr = typeof date === 'string' && date.includes('T') ? date.split('T')[0] : date;
        const targetDate = new Date(`${dateStr}T00:00:00.000Z`);

        if (isNaN(targetDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        const log = await DailyLog.findOne({ userId, date: targetDate });

        if (!log) {
            return res.status(404).json({ error: 'Log not found' });
        }

        res.json(log);
    } catch (error) {
        console.error('Error fetching log:', error);
        res.status(500).json({ error: 'Failed to fetch log', details: String(error) });
    }
});

// POST /api/logs - Create or update a daily log for current user
router.post('/', async (req: Request, res: Response) => {
    try {
        // Verify user exists
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const userId = req.user._id;
        const { date, hoursWorked, tasks, status } = req.body;

        console.log('POST /api/logs - Request body:', { date, hoursWorked, tasks, status });
        console.log('POST /api/logs - userId:', userId);

        // Validate required fields
        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        const dateStr = typeof date === 'string' && date.includes('T') ? date.split('T')[0] : date;
        const logDate = new Date(`${dateStr}T00:00:00.000Z`);

        console.log('POST /api/logs - Parsed date:', logDate);

        // Validate date is valid
        if (isNaN(logDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        let log = await DailyLog.findOne({ userId, date: logDate });

        if (log) {
            console.log('POST /api/logs - Updating existing log');
            log.hoursWorked = hoursWorked ?? log.hoursWorked;
            log.tasks = tasks ?? log.tasks;
            log.status = status ?? log.status;
            await log.save();
        } else {
            console.log('POST /api/logs - Creating new log');
            log = await DailyLog.create({
                userId,
                date: logDate,
                hoursWorked: hoursWorked ?? 8,
                tasks: tasks ?? '',
                status: status ?? 'scheduled',
            });
        }

        console.log('POST /api/logs - Success:', log._id);
        res.json(log);
    } catch (error: any) {
        console.error('Error saving log:', error);
        console.error('Error name:', error?.name);
        console.error('Error message:', error?.message);
        console.error('Error stack:', error?.stack);
        res.status(500).json({ 
            error: 'Failed to save log', 
            details: error?.message || String(error),
            name: error?.name 
        });
    }
});

// DELETE /api/logs/:date - Delete a log entry for current user
router.delete('/:date', async (req: Request, res: Response) => {
    try {
        const userId = req.user!._id;
        const { date } = req.params;
        
        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }
        
        const dateStr = typeof date === 'string' && date.includes('T') ? date.split('T')[0] : date;
        const targetDate = new Date(`${dateStr}T00:00:00.000Z`);

        if (isNaN(targetDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        const result = await DailyLog.deleteOne({ userId, date: targetDate });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Log not found' });
        }

        res.json({ message: 'Log deleted successfully' });
    } catch (error) {
        console.error('Error deleting log:', error);
        res.status(500).json({ error: 'Failed to delete log', details: String(error) });
    }
});

// DELETE /api/logs - Delete all logs for current user (reset)
router.delete('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user!._id;
        await DailyLog.deleteMany({ userId });
        res.json({ message: 'All logs deleted successfully' });
    } catch (error) {
        console.error('Error deleting all logs:', error);
        res.status(500).json({ error: 'Failed to delete logs' });
    }
});

export default router;
