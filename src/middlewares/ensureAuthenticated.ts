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
        const decoded = verify(token);
        // Adiciona o userId ao objeto request (requer Type Definition ou uso de as any)
        (req as any).userId = decoded.id;

        return next();
    } catch (err) {
        throw new AppError('Invalid token', 401);
    }
};
