import { Router, Request, Response } from 'express';
import Settings from '../models/Settings.js';

const router = Router();

// GET /api/settings - Get current settings (creates default if none exists)
router.get('/', async (_req: Request, res: Response) => {
    try {
        let settings = await Settings.findOne();

        if (!settings) {
            // Create default settings if none exists
            settings = await Settings.create({
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

// PUT /api/settings - Update settings
router.put('/', async (req: Request, res: Response) => {
    try {
        const {
            targetHours,
            startDate,
            hoursPerDay,
            excludeHolidays,
            workDays,
            autoProjection,
        } = req.body;

        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create({
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

// DELETE /api/settings - Reset to defaults
router.delete('/', async (_req: Request, res: Response) => {
    try {
        await Settings.deleteMany({});
        const settings = await Settings.create({
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
