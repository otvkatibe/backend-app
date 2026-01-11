import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const meta = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            requestId: req.id,
            ip: req.ip
        };

        if (res.statusCode >= 400) {
            logger.warn('Request failed', meta);
        } else {
            logger.info('Request completed', meta);
        }
    });

    next();
};
