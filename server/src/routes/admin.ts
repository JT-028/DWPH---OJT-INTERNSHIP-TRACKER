import { Router, Request, Response } from 'express';
import User from '../models/User.js';
import DailyLog from '../models/DailyLog.js';
import Settings from '../models/Settings.js';
import { authenticate, requireAdmin, requireAdminOrSubAdmin } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// GET /api/admin/users - List all users (admin or sub-admin)
router.get('/users', requireAdminOrSubAdmin, async (_req: Request, res: Response) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });

        // Fetch hours completed for each user
        const usersWithProgress = await Promise.all(
            users.map(async (user) => {
                const logs = await DailyLog.find({ userId: user._id, status: 'completed' });
                const totalHoursCompleted = logs.reduce((sum, log) => sum + log.hoursWorked, 0);
                const settings = await Settings.findOne({ userId: user._id });

                return {
                    ...user.toJSON(),
                    totalHoursCompleted,
                    targetHours: settings?.targetHours || 0,
                };
            })
        );

        res.json(usersWithProgress);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// POST /api/admin/users/sub-admin - Create sub-admin account (main admin only)
router.post('/users/sub-admin', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            res.status(400).json({ error: 'Name, email, and password are required' });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters' });
            return;
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(409).json({ error: 'Email already registered' });
            return;
        }

        const user = await User.create({
            email,
            password,
            name,
            role: 'sub-admin',
        });

        res.status(201).json(user.toJSON());
    } catch (error) {
        console.error('Error creating sub-admin:', error);
        res.status(500).json({ error: 'Failed to create sub-admin' });
    }
});

// PUT /api/admin/users/:id - Update user active status (admin or sub-admin)
router.put('/users/:id', requireAdminOrSubAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Prevent modifying the main admin account
        if (user.role === 'admin') {
            res.status(403).json({ error: 'Cannot modify the main admin account' });
            return;
        }

        // Sub-admins can only toggle active status for interns
        if (req.user?.role === 'sub-admin' && user.role === 'sub-admin') {
            res.status(403).json({ error: 'Sub-admins cannot modify other sub-admin accounts' });
            return;
        }

        if (isActive !== undefined) {
            user.isActive = isActive;
        }

        await user.save();
        res.json(user.toJSON());
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// PUT /api/admin/users/:id/role - Change user role (main admin only)
router.put('/users/:id/role', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['intern', 'sub-admin'].includes(role)) {
            res.status(400).json({ error: 'Role must be "intern" or "sub-admin"' });
            return;
        }

        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (user.role === 'admin') {
            res.status(403).json({ error: 'Cannot change the main admin role' });
            return;
        }

        user.role = role;
        await user.save();
        res.json(user.toJSON());
    } catch (error) {
        console.error('Error changing user role:', error);
        res.status(500).json({ error: 'Failed to change role' });
    }
});

// DELETE /api/admin/users/:id - Delete user and their data (main admin only)
router.delete('/users/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (user.role === 'admin') {
            res.status(403).json({ error: 'Cannot delete the main admin account' });
            return;
        }

        // Delete user's data
        await DailyLog.deleteMany({ userId: id });
        await Settings.deleteMany({ userId: id });
        await User.findByIdAndDelete(id);

        res.json({ message: 'User and their data deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// GET /api/admin/users/:id/progress - View specific intern's progress (admin or sub-admin)
router.get('/users/:id/progress', requireAdminOrSubAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const settings = await Settings.findOne({ userId: id });
        const logs = await DailyLog.find({ userId: id, status: 'completed' });

        const totalHoursCompleted = logs.reduce((sum, log) => sum + log.hoursWorked, 0);
        const totalDaysCompleted = logs.length;
        const targetHours = settings?.targetHours || 500;
        const remainingHours = Math.max(0, targetHours - totalHoursCompleted);
        const progressPercentage = Math.min(100, (totalHoursCompleted / targetHours) * 100);

        res.json({
            user: user.toJSON(),
            progress: {
                totalHoursCompleted,
                totalDaysCompleted,
                remainingHours,
                progressPercentage: Math.round(progressPercentage * 100) / 100,
                targetHours,
            },
            logs,
        });
    } catch (error) {
        console.error('Error fetching user progress:', error);
        res.status(500).json({ error: 'Failed to fetch user progress' });
    }
});

export default router;
