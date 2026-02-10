import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.js';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

const JWT_SECRET = process.env.JWT_SECRET || 'dwph-ojt-default-secret';

// Generate JWT token
export const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Authenticate middleware - verifies JWT and attaches user to request
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const user = await User.findById(decoded.userId);

        if (!user) {
            res.status(401).json({ error: 'User not found' });
            return;
        }

        if (!user.isActive) {
            res.status(403).json({ error: 'Account is deactivated' });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Require admin role
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    next();
};

// Require admin or sub-admin role
export const requireAdminOrSubAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'sub-admin')) {
        res.status(403).json({ error: 'Admin or sub-admin access required' });
        return;
    }
    next();
};
