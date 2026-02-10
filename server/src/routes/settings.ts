import { Router, Request, Response } from 'express';
import Settings from '../models/Settings.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All settings routes require authentication
router.use(authenticate);

// GET /api/settings - Get current user's settings (creates default if none exists)
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user!._id;
        let settings = await Settings.findOne({ userId });

        if (!settings) {
            // Create default settings for this user
            settings = await Settings.create({
                userId,
                targetHours: 500,
                startDate: new Date(),
                hoursPerDay: 8,
                excludeHolidays: true,
                workDays: [1, 2, 3, 4, 5],
                autoProjection: true,
            });
        }

        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// PUT /api/settings - Update current user's settings
router.put('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user!._id;
        const {
            targetHours,
            startDate,
            hoursPerDay,
            excludeHolidays,
            workDays,
            autoProjection,
        } = req.body;

        let settings = await Settings.findOne({ userId });

        if (!settings) {
            settings = await Settings.create({
                userId,
                targetHours,
                startDate,
                hoursPerDay,
                excludeHolidays,
                workDays,
                autoProjection,
            });
        } else {
            settings.targetHours = targetHours ?? settings.targetHours;
            settings.startDate = startDate ?? settings.startDate;
            settings.hoursPerDay = hoursPerDay ?? settings.hoursPerDay;
            settings.excludeHolidays = excludeHolidays ?? settings.excludeHolidays;
            settings.workDays = workDays ?? settings.workDays;
            settings.autoProjection = autoProjection ?? settings.autoProjection;
            await settings.save();
        }

        res.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// DELETE /api/settings - Reset current user's settings to defaults
router.delete('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user!._id;
        await Settings.deleteMany({ userId });
        const settings = await Settings.create({
            userId,
            targetHours: 500,
            startDate: new Date(),
            hoursPerDay: 8,
            excludeHolidays: true,
            workDays: [1, 2, 3, 4, 5],
            autoProjection: true,
        });
        res.json(settings);
    } catch (error) {
        console.error('Error resetting settings:', error);
        res.status(500).json({ error: 'Failed to reset settings' });
    }
});

export default router;
