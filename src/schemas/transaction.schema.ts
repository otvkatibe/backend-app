import { z } from 'zod';

export const createTransactionSchema = z.object({
    body: z.object({
        amount: z.number().positive('Amount must be positive'),
        type: z.enum(['INCOME', 'EXPENSE']),
        date: z.string().datetime(),
        description: z.string().optional(),
        walletId: z.string().uuid(),
        categoryId: z.string().uuid(),
    }),
});

export const listTransactionsSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        walletId: z.string().uuid().optional(),
    }),
});

export type CreateTransactionDTO = z.infer<typeof createTransactionSchema>['body'];
export type ListTransactionsDTO = z.infer<typeof listTransactionsSchema>['query'];
