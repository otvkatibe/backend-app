import { Request, Response } from 'express';
import { budgetService } from '../services/budget.service';

class BudgetController {
    async upsert(req: Request, res: Response) {
        const userId = req.user!.id;
        const budget = await budgetService.upsert(userId, req.body);
        return res.status(200).json(budget);
    }

    async list(req: Request, res: Response) {
        const userId = req.user!.id;
        const budgets = await budgetService.list(userId, req.query);
        return res.json(budgets);
    }
}

export const budgetController = new BudgetController();
