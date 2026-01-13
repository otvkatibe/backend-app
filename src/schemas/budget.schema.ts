import { z } from 'zod';

export const upsertBudgetSchema = z.object({
    body: z.object({
        categoryId: z.string().uuid(),
        amount: z.number().positive(),
        month: z.number().min(1).max(12),
        year: z.number().int().min(2023),
    }),
});

export const listBudgetsSchema = z.object({
    query: z.object({
        month: z.string().regex(/^\d+$/).transform(Number).optional(),
        year: z.string().regex(/^\d+$/).transform(Number).optional(),
        page: z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    }).optional(),
});
