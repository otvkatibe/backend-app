import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import {
    handlePrismaError,
    handleZodError,
    handleJWTError,
    handleAppError,
    handleGenericError,
    handleSyntaxError,
    isPrismaError
} from './errorMappers';
import { logger } from '../utils/logger';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Log exception (Traceability)
    logger.error('Unhandled Exception escaped to ErrorHandler', {
        error: err.message,
        stack: err.stack,
        requestId: (req as any).id // Assuming req.id might not be directly on Request type
    });
    // 1. Business Logic Errors (Explicitly thrown by us)
    if (err instanceof AppError) {
        return handleAppError(err, res);
    }

    // 2. Input Validation Errors (Zod)
    if (err instanceof ZodError) {
        return handleZodError(err, res);
    }

    // 3. Database Errors (Prisma)
    if (isPrismaError(err)) {
        return handlePrismaError(err, res);
    }

    // 4. Authentication Errors (JWT)
    if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
        return handleJWTError(err, res);
    }

    // 5. Malformed JSON (Express/BodyParser)
    // Note: 'status' property exists on some Express/BodyParser syntax errors
    if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
        return handleSyntaxError(err, res);
    }

    // 6. Unknown/Unhandled Errors
    return handleGenericError(err, res);
};
