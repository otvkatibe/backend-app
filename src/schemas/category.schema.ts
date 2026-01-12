import { z } from 'zod';

export const createCategorySchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required').max(50),
    }),
});

export const updateCategorySchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        name: z.string().min(1).max(50),
    }),
});

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>['body'];
