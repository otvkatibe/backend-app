import { Request, Response, NextFunction } from 'express';

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
    isPrismaError,
} from './errorMappers';
import { logger } from '../utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    // Log exception (Traceability)
    logger.error('Exceção não tratada capturada pelo ErrorHandler', {
        error: err.message,
        stack: err.stack,
        requestId: (req as Request & { id?: string }).id,
    });
    // 1. Erros de Regra de Negócio (Lançados explicitamente por nós)
    if (err instanceof AppError) {
        return handleAppError(err, res);
    }

    // 2. Erros de Validação de Input (Zod)
    if (err instanceof ZodError) {
        return handleZodError(err, res);
    }

    // 3. Erros de Banco de Dados (Prisma)
    if (isPrismaError(err)) {
        return handlePrismaError(err, res);
    }

    // 4. Erros de Autenticação (JWT)
    if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
        return handleJWTError(err, res);
    }

    // 5. JSON Malformado (Express/BodyParser)
    // Nota: propriedade 'status' existe em alguns erros de sintaxe do Express/BodyParser
    if (err instanceof SyntaxError && 'status' in err && (err as { status?: number }).status === 400 && 'body' in err) {
        return handleSyntaxError(err, res);
    }

    // 6. Unknown/Unhandled Errors
    return handleGenericError(err, res);
};
