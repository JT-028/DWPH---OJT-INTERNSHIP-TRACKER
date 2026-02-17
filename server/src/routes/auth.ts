import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register - Register a new intern account
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password, name, department } = req.body;

        // Validate required fields
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

        // Create intern account (only intern role allowed via public registration)
        const user = await User.create({
            email,
            password,
            name,
            role: 'intern',
            department: department || '',
        });

        const token = generateToken(String(user._id));

        res.status(201).json({
            user: user.toJSON(),
            token,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/auth/login - Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Find user by email (include password for comparison)
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        if (!user.isActive) {
            res.status(403).json({ error: 'Account is deactivated. Contact an admin.' });
            return;
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const token = generateToken(String(user._id));

        res.json({
            user: user.toJSON(),
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticate, async (req: Request, res: Response) => {
    try {
        res.json(req.user?.toJSON());
    } catch (error) {
        console.error('Auth me error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// PUT /api/auth/profile - Update current user's profile
router.put('/profile', authenticate, async (req: Request, res: Response) => {
    try {
        const { name, department, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user?._id);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Update name if provided
        if (name && name.trim()) {
            user.name = name.trim();
        }

        // Update department if provided (and valid)
        const validDepartments = ['Creative & Marketing Support Associates', 'Recruitment Support Interns', 'IT Support Interns', ''];
        if (department !== undefined && validDepartments.includes(department)) {
            user.department = department;
        }

        // Update password if both current and new are provided
        if (currentPassword && newPassword) {
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                res.status(400).json({ error: 'Current password is incorrect' });
                return;
            }
            if (newPassword.length < 6) {
                res.status(400).json({ error: 'New password must be at least 6 characters' });
                return;
            }
            user.password = newPassword;
        }

        await user.save();
        res.json(user.toJSON());
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// POST /api/auth/seed-admin - One-time admin seed (secured by seed key)
router.post('/seed-admin', async (req: Request, res: Response) => {
    try {
        const { seedKey } = req.body;

        // Simple security: require a seed key that matches JWT_SECRET
        const jwtSecret = (process.env.JWT_SECRET || '').trim();
        if (!seedKey || seedKey.trim() !== jwtSecret) {
            res.status(403).json({ error: 'Invalid seed key' });
            return;
        }

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            res.json({ message: 'Admin already exists', email: existingAdmin.email });
            return;
        }

        // Create main admin
        const admin = await User.create({
            email: 'admin@dwph.com',
            password: 'admin123',
            name: 'Main Admin',
            role: 'admin',
            isActive: true,
        });

        res.status(201).json({
            message: 'Admin created successfully',
            email: admin.email,
            note: 'Default password: admin123 — change after first login!',
        });
    } catch (error) {
        console.error('Seed admin error:', error);
        res.status(500).json({ error: 'Failed to seed admin' });
    }
});

export default router;
