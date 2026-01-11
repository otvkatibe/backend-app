import { Response } from 'express';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

// Duck-typing interface for Prisma Errors since types are flaky in this env
interface PrismaError extends Error {
    code: string;
    meta?: Record<string, unknown>;
    clientVersion?: string;
}

export const isPrismaError = (err: any): err is PrismaError => {
    return (
        err &&
        typeof err === 'object' &&
        typeof err.code === 'string' &&
        (err.clientVersion || err.name?.includes('Prisma')) // Robust check
    );
};

export const handlePrismaError = (err: PrismaError, res: Response) => {
    switch (err.code) {
        case 'P2002': // Unique constraint violation
            const target = (err.meta?.target as string[]) || 'Field';
            return res.status(409).json({
                status: 'error',
                message: `Conflict: ${target} already exists.`,
            });
        case 'P2025': // Record not found
            return res.status(404).json({
                status: 'error',
                message: 'Record not found.',
            });
        case 'P2003': // Foreign key constraint failed
            return res.status(400).json({
                status: 'error',
                message: 'Invalid reference operation. Foreign key constraint failed.',
            });
        default:
            console.error('Unhandled Prisma Error:', err);
            return res.status(500).json({
                status: 'error',
                message: 'Database operation failed.'
            });
    }
};

export const handleZodError = (err: ZodError, res: Response) => {
    const formattedErrors = err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
    }));

    return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: formattedErrors,
    });
};

export const handleJWTError = (err: JsonWebTokenError | TokenExpiredError, res: Response) => {
    if (err instanceof TokenExpiredError) {
        return res.status(401).json({
            status: 'error',
            message: 'Session expired. Please log in again.',
        });
    }

    return res.status(401).json({
        status: 'error',
        message: 'Invalid token. Please log in again.',
    });
};

export const handleAppError = (err: AppError, res: Response) => {
    return res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
    });
};

export const handleSyntaxError = (err: SyntaxError, res: Response) => {
    return res.status(400).json({
        status: 'error',
        message: 'Malformed JSON payload.'
    });
}

export const handleGenericError = (err: Error, res: Response) => {
    console.error('🔥 CRITICAL ERROR:', err); // Log full stacktrace for debugging
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error.',
    });
};
