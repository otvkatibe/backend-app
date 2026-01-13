import { Request, Response, NextFunction } from 'express';
import { RecurringTransactionService } from '../services/recurring.service';
import { z } from 'zod';

const recurringService = new RecurringTransactionService();

const createSchema = z.object({
    amount: z.number().positive(),
    type: z.enum(['INCOME', 'EXPENSE']),
    description: z.string().optional(),
    interval: z.string().min(1), // Basic check, service validates cron
    walletId: z.string().uuid(),
    categoryId: z.string().uuid(),
});

export const createRecurring = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = createSchema.parse(req.body);
        const recurring = await recurringService.create(req.user!.id, data);
        res.status(201).json(recurring);
    } catch (error) {
        next(error);
    }
};

export const listRecurring = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const list = await recurringService.list(req.user!.id);
        res.json(list);
    } catch (error) {
        next(error);
    }
};

export const cancelRecurring = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await recurringService.cancel(req.user!.id, id as string);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
