import { Request, Response } from 'express';
import { budgetService } from '../services/budget.service';

import { upsertBudgetSchema, listBudgetsSchema } from '../schemas/budget.schema';

class BudgetController {
    async upsert(req: Request, res: Response) {
        const userId = req.user!.id;
        const { body } = upsertBudgetSchema.parse(req);
        const budget = await budgetService.upsert(userId, body);
        return res.status(200).json(budget);
    }

    async list(req: Request, res: Response) {
        const userId = req.user!.id;
        const { query } = listBudgetsSchema.parse(req);
        const budgets = await budgetService.list(userId, query || {});
        return res.json(budgets);
    }
}

export const budgetController = new BudgetController();
