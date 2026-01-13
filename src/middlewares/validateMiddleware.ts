import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export const validate = (schema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        }) as any;

        req.body = parsed.body;
        req.body = parsed.body;
        // req.query e req.params podem ser read-only em algumas versoes do Express/types
        // A sanitizacao do body e a mais importante para evitar erros do Prisma
        if (parsed.query) Object.assign(req.query, parsed.query);
        if (parsed.params) Object.assign(req.params, parsed.params);
        return next();
    } catch (error) {
        if (error instanceof ZodError) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorMessage = (error as any).errors.map((e: any) => e.message).join(', ');
            return next(new AppError(`Falha na validacao: ${errorMessage}`, 400));
        }
        return next(error);
    }
};
