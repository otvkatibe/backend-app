import { z } from 'zod';

export const createGoalSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        targetAmount: z.number().positive(),
        deadline: z.string().datetime().optional(),
    }),
});

export const addFundsSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        amount: z.number().positive(),
    }),
});
