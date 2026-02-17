import { Router, Request, Response } from 'express';
import User from '../models/User.js';
import DailyLog from '../models/DailyLog.js';
import Settings from '../models/Settings.js';
import { authenticate, requireAdmin, requireAdminOrSubAdmin } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// GET /api/admin/users - List all users (admin or sub-admin)
// Sub-admins only see interns assigned to them; admins see everyone
router.get('/users', requireAdminOrSubAdmin, async (req: Request, res: Response) => {
    try {
        const currentUser = req.user!;
        let query: any = {};

        // Sub-admins only see their assigned interns
        if (currentUser.role === 'sub-admin') {
            query = {
                $or: [
                    { supervisors: currentUser._id }, // Interns assigned to this sub-admin
                    { _id: currentUser._id }, // Themselves
                ]
            };
        }

        const users = await User.find(query).sort({ createdAt: -1 });

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
        const currentUser = req.user!;

        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Sub-admins can only view their assigned interns
        if (currentUser.role === 'sub-admin') {
            const isAssigned = user.supervisors?.some((s: any) => s.toString() === currentUser._id.toString());
            if (!isAssigned && user._id.toString() !== currentUser._id.toString()) {
                res.status(403).json({ error: 'You do not have access to this intern' });
                return;
            }
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

// Helper function to check if current user can access target intern
const canAccessIntern = async (currentUser: any, internId: string): Promise<boolean> => {
    // Admins can access everyone
    if (currentUser.role === 'admin') return true;

    // Sub-admins can only access interns assigned to them
    const intern = await User.findById(internId);
    if (!intern) return false;

    // Check if current sub-admin is in the intern's supervisors list
    return intern.supervisors?.some((s: any) => s.toString() === currentUser._id.toString()) || false;
};

// GET /api/admin/supervisors - Get list of available supervisors (sub-admins and admins)
router.get('/supervisors', requireAdmin, async (_req: Request, res: Response) => {
    try {
        const supervisors = await User.find({
            role: { $in: ['admin', 'sub-admin'] },
            isActive: true
        }).select('_id name email role');

        res.json(supervisors);
    } catch (error) {
        console.error('Error fetching supervisors:', error);
        res.status(500).json({ error: 'Failed to fetch supervisors' });
    }
});

// PUT /api/admin/users/:id/supervisors - Assign supervisors to an intern (admin only)
router.put('/users/:id/supervisors', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { supervisorIds } = req.body;

        if (!Array.isArray(supervisorIds)) {
            res.status(400).json({ error: 'supervisorIds must be an array' });
            return;
        }

        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (user.role !== 'intern') {
            res.status(400).json({ error: 'Can only assign supervisors to interns' });
            return;
        }

        // Validate all supervisor IDs exist and are admins/sub-admins
        const validSupervisors = await User.find({
            _id: { $in: supervisorIds },
            role: { $in: ['admin', 'sub-admin'] },
            isActive: true
        });

        if (validSupervisors.length !== supervisorIds.length) {
            res.status(400).json({ error: 'Some supervisor IDs are invalid' });
            return;
        }

        user.supervisors = supervisorIds;
        await user.save();

        res.json(user.toJSON());
    } catch (error) {
        console.error('Error assigning supervisors:', error);
        res.status(500).json({ error: 'Failed to assign supervisors' });
    }
});

// GET /api/admin/users/:id/logs - Get all logs for a specific intern
router.get('/users/:id/logs', requireAdminOrSubAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const currentUser = req.user!;

        // Check authorization
        if (!(await canAccessIntern(currentUser, id))) {
            res.status(403).json({ error: 'You do not have access to this intern' });
            return;
        }

        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const logs = await DailyLog.find({ userId: id })
            .sort({ date: -1 })
            .populate('validatedBy', 'name')
            .populate('markedByAdmin', 'name');

        res.json({
            user: user.toJSON(),
            logs,
        });
    } catch (error) {
        console.error('Error fetching intern logs:', error);
        res.status(500).json({ error: 'Failed to fetch intern logs' });
    }
});

// GET /api/admin/users/:id/logs/:date - Get a specific log by date for an intern
router.get('/users/:id/logs/:date', requireAdminOrSubAdmin, async (req: Request, res: Response) => {
    try {
        const { id, date } = req.params;
        const currentUser = req.user!;

        // Check authorization
        if (!(await canAccessIntern(currentUser, id))) {
            res.status(403).json({ error: 'You do not have access to this intern' });
            return;
        }

        const dateStr = date.includes('T') ? date.split('T')[0] : date;
        const targetDate = new Date(`${dateStr}T00:00:00.000Z`);

        if (isNaN(targetDate.getTime())) {
            res.status(400).json({ error: 'Invalid date format' });
            return;
        }

        const log = await DailyLog.findOne({ userId: id, date: targetDate })
            .populate('validatedBy', 'name')
            .populate('markedByAdmin', 'name');

        if (!log) {
            res.status(404).json({ error: 'Log not found' });
            return;
        }

        res.json(log);
    } catch (error) {
        console.error('Error fetching intern log:', error);
        res.status(500).json({ error: 'Failed to fetch intern log' });
    }
});

// GET /api/admin/users/:id/logs/pending - Get unvalidated completed logs for an intern
router.get('/users/:id/logs-pending', requireAdminOrSubAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const currentUser = req.user!;

        // Check authorization
        if (!(await canAccessIntern(currentUser, id))) {
            res.status(403).json({ error: 'You do not have access to this intern' });
            return;
        }

        const logs = await DailyLog.find({
            userId: id,
            status: 'completed',
            isValidated: { $ne: true }
        })
            .sort({ date: -1 })
            .populate('validatedBy', 'name')
            .populate('markedByAdmin', 'name');

        res.json(logs);
    } catch (error) {
        console.error('Error fetching pending logs:', error);
        res.status(500).json({ error: 'Failed to fetch pending logs' });
    }
});

// PUT /api/admin/users/:id/logs/:date/validate - Mark a log as validated
router.put('/users/:id/logs/:date/validate', requireAdminOrSubAdmin, async (req: Request, res: Response) => {
    try {
        const { id, date } = req.params;
        const { notes } = req.body;
        const currentUser = req.user!;

        // Check authorization
        if (!(await canAccessIntern(currentUser, id))) {
            res.status(403).json({ error: 'You do not have access to this intern' });
            return;
        }

        const dateStr = date.includes('T') ? date.split('T')[0] : date;
        const targetDate = new Date(`${dateStr}T00:00:00.000Z`);

        if (isNaN(targetDate.getTime())) {
            res.status(400).json({ error: 'Invalid date format' });
            return;
        }

        const log = await DailyLog.findOne({ userId: id, date: targetDate });
        if (!log) {
            res.status(404).json({ error: 'Log not found' });
            return;
        }

        if (log.status !== 'completed') {
            res.status(400).json({ error: 'Can only validate completed logs' });
            return;
        }

        log.isValidated = true;
        log.validatedBy = currentUser._id;
        log.validatedAt = new Date();
        log.validationNotes = notes || '';
        await log.save();

        const updatedLog = await DailyLog.findById(log._id)
            .populate('validatedBy', 'name')
            .populate('markedByAdmin', 'name');

        res.json(updatedLog);
    } catch (error) {
        console.error('Error validating log:', error);
        res.status(500).json({ error: 'Failed to validate log' });
    }
});

// PUT /api/admin/users/:id/logs/:date/invalidate - Remove validation from a log
router.put('/users/:id/logs/:date/invalidate', requireAdminOrSubAdmin, async (req: Request, res: Response) => {
    try {
        const { id, date } = req.params;
        const { reason } = req.body;
        const currentUser = req.user!;

        // Check authorization
        if (!(await canAccessIntern(currentUser, id))) {
            res.status(403).json({ error: 'You do not have access to this intern' });
            return;
        }

        const dateStr = date.includes('T') ? date.split('T')[0] : date;
        const targetDate = new Date(`${dateStr}T00:00:00.000Z`);

        if (isNaN(targetDate.getTime())) {
            res.status(400).json({ error: 'Invalid date format' });
            return;
        }

        const log = await DailyLog.findOne({ userId: id, date: targetDate });
        if (!log) {
            res.status(404).json({ error: 'Log not found' });
            return;
        }

        log.isValidated = false;
        log.validatedBy = undefined;
        log.validatedAt = undefined;
        log.validationNotes = reason ? `Invalidated: ${reason}` : '';
        await log.save();

        const updatedLog = await DailyLog.findById(log._id)
            .populate('validatedBy', 'name')
            .populate('markedByAdmin', 'name');

        res.json(updatedLog);
    } catch (error) {
        console.error('Error invalidating log:', error);
        res.status(500).json({ error: 'Failed to invalidate log' });
    }
});

// PUT /api/admin/users/:id/logs/validate-bulk - Validate multiple logs at once
router.put('/users/:id/logs/validate-bulk', requireAdminOrSubAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { dates, notes } = req.body;
        const currentUser = req.user!;

        if (!Array.isArray(dates) || dates.length === 0) {
            res.status(400).json({ error: 'dates must be a non-empty array' });
            return;
        }

        // Check authorization
        if (!(await canAccessIntern(currentUser, id))) {
            res.status(403).json({ error: 'You do not have access to this intern' });
            return;
        }

        const results = await Promise.all(
            dates.map(async (date: string) => {
                const dateStr = date.includes('T') ? date.split('T')[0] : date;
                const targetDate = new Date(`${dateStr}T00:00:00.000Z`);

                if (isNaN(targetDate.getTime())) {
                    return { date, success: false, error: 'Invalid date format' };
                }

                const log = await DailyLog.findOne({ userId: id, date: targetDate });
                if (!log) {
                    return { date, success: false, error: 'Log not found' };
                }

                if (log.status !== 'completed') {
                    return { date, success: false, error: 'Can only validate completed logs' };
                }

                log.isValidated = true;
                log.validatedBy = currentUser._id;
                log.validatedAt = new Date();
                log.validationNotes = notes || '';
                await log.save();

                return { date, success: true };
            })
        );

        res.json({ results });
    } catch (error) {
        console.error('Error bulk validating logs:', error);
        res.status(500).json({ error: 'Failed to bulk validate logs' });
    }
});

// PUT /api/admin/users/:id/logs/:date/special-workday - Mark a date as special workday (weekend/holiday)
router.put('/users/:id/logs/:date/special-workday', requireAdminOrSubAdmin, async (req: Request, res: Response) => {
    try {
        const { id, date } = req.params;
        const { reason, hoursWorked, tasks } = req.body;
        const currentUser = req.user!;

        // Check authorization
        if (!(await canAccessIntern(currentUser, id))) {
            res.status(403).json({ error: 'You do not have access to this intern' });
            return;
        }

        const dateStr = date.includes('T') ? date.split('T')[0] : date;
        const targetDate = new Date(`${dateStr}T00:00:00.000Z`);

        if (isNaN(targetDate.getTime())) {
            res.status(400).json({ error: 'Invalid date format' });
            return;
        }

        // Find existing log or create new one
        let log = await DailyLog.findOne({ userId: id, date: targetDate });

        if (log) {
            // Update existing log
            log.isSpecialWorkday = true;
            log.specialWorkdayReason = reason || 'Weekend/Holiday work';
            log.markedByAdmin = currentUser._id;
            if (hoursWorked !== undefined) log.hoursWorked = hoursWorked;
            if (tasks !== undefined) log.tasks = tasks;
            if (log.status !== 'completed') log.status = 'completed';
            await log.save();
        } else {
            // Create new log for this special workday
            log = await DailyLog.create({
                userId: id,
                date: targetDate,
                hoursWorked: hoursWorked ?? 8,
                tasks: tasks ?? '',
                status: 'completed',
                isSpecialWorkday: true,
                specialWorkdayReason: reason || 'Weekend/Holiday work',
                markedByAdmin: currentUser._id,
            });
        }

        const updatedLog = await DailyLog.findById(log._id)
            .populate('validatedBy', 'name')
            .populate('markedByAdmin', 'name');

        res.json(updatedLog);
    } catch (error) {
        console.error('Error marking special workday:', error);
        res.status(500).json({ error: 'Failed to mark special workday' });
    }
});

// PUT /api/admin/users/:id/logs/:date/remove-special-workday - Remove special workday status
router.put('/users/:id/logs/:date/remove-special-workday', requireAdminOrSubAdmin, async (req: Request, res: Response) => {
    try {
        const { id, date } = req.params;
        const currentUser = req.user!;

        // Check authorization
        if (!(await canAccessIntern(currentUser, id))) {
            res.status(403).json({ error: 'You do not have access to this intern' });
            return;
        }

        const dateStr = date.includes('T') ? date.split('T')[0] : date;
        const targetDate = new Date(`${dateStr}T00:00:00.000Z`);

        if (isNaN(targetDate.getTime())) {
            res.status(400).json({ error: 'Invalid date format' });
            return;
        }

        const log = await DailyLog.findOne({ userId: id, date: targetDate });
        if (!log) {
            res.status(404).json({ error: 'Log not found' });
            return;
        }

        log.isSpecialWorkday = false;
        log.specialWorkdayReason = '';
        log.markedByAdmin = undefined;
        await log.save();

        const updatedLog = await DailyLog.findById(log._id)
            .populate('validatedBy', 'name')
            .populate('markedByAdmin', 'name');

        res.json(updatedLog);
    } catch (error) {
        console.error('Error removing special workday:', error);
        res.status(500).json({ error: 'Failed to remove special workday' });
    }
});

export default router;
