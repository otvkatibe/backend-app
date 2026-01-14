import { z } from 'zod';

export const createWalletSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required').max(50),
        balance: z.number().optional().default(0),
        currency: z.string().optional().default('BRL'),
    }),
});

export const updateWalletSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        name: z.string().min(1).max(50),
    }),
});

export type CreateWalletDTO = z.infer<typeof createWalletSchema>['body'];
export type UpdateWalletDTO = z.infer<typeof updateWalletSchema>['body'];
