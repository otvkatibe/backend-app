import { Request, Response, NextFunction } from 'express';
import { verify } from '../utils/jwt';
import { AppError } from '../utils/AppError';

export const ensureAuthenticated = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new AppError('Token missing', 401);
    }

    const [, token] = authHeader.split(' ');

    try {
        const { id, role } = verify(token);

        req.user = {
            id,
            role
        };

        return next();
    } catch (err) {
        throw new AppError('Invalid token', 401);
    }
};
