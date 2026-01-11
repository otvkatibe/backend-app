import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const authorize = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        console.log('Authorize Middleware - User:', req.user);
        console.log('Authorize Middleware - Allowed:', allowedRoles);

        if (!req.user) {
            throw new AppError('User not authenticated', 401);
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new AppError('Access denied: Insufficient permissions', 403);
        }

        return next();
    };
};
