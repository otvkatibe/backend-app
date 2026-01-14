import { Response } from 'express';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

interface PrismaError extends Error {
    code: string;
    meta?: Record<string, unknown>;
    clientVersion?: string;
}

export const isPrismaError = (err: unknown): err is PrismaError => {
    const e = err as Record<string, unknown>;
    return (
        err !== null &&
        typeof err === 'object' &&
        typeof e.code === 'string' &&
        (typeof e.clientVersion === 'string' || (typeof e.name === 'string' && e.name.includes('Prisma')))
    );
};

export const handlePrismaError = (err: PrismaError, res: Response) => {
    switch (err.code) {
        case 'P2002': // Unique constraint violation
            const target = (err.meta?.target as string[]) || 'Field';
            return res.status(409).json({
                status: 'error',
                message: `Conflito: ${target} ja existe.`,
            });
        case 'P2025': // Record not found
            return res.status(404).json({
                status: 'error',
                message: 'Registro nao encontrado.',
            });
        case 'P2003': // Foreign key constraint failed
            return res.status(400).json({
                status: 'error',
                message: 'Operacao de referencia invalida. Violacao de chave estrangeira.',
            });
        default:
            console.error('Unhandled Prisma Error:', err);
            return res.status(500).json({
                status: 'error',
                message: 'Falha na operacao do banco de dados.',
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
        message: 'Falha na validacao',
        errors: formattedErrors,
    });
};

export const handleJWTError = (err: JsonWebTokenError | TokenExpiredError, res: Response) => {
    if (err instanceof TokenExpiredError) {
        return res.status(401).json({
            status: 'error',
            message: 'Sessao expirada. Por favor, faca login novamente.',
        });
    }

    return res.status(401).json({
        status: 'error',
        message: 'Token invalido. Por favor, faca login novamente.',
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
        message: 'Payload JSON malformado.',
    });
};

export const handleGenericError = (err: Error, res: Response) => {
    // Note: We don't need to log here anymore because the main errorHandler already logged it.
    // Or we can log specific details if needed.

    return res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
    });
};
