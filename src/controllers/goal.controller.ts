import { Request, Response } from 'express';
import { goalService } from '../services/goal.service';

class GoalController {
    async create(req: Request, res: Response) {
        const userId = req.user!.id;
        const goal = await goalService.create(userId, req.body);
        return res.status(201).json(goal);
    }

    async addFunds(req: Request, res: Response) {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };
        const { amount } = req.body;
        const goal = await goalService.addFunds(userId, id, amount);
        return res.json(goal);
    }

    async list(req: Request, res: Response) {
        const userId = req.user!.id;
        const goals = await goalService.list(userId);
        return res.json(goals);
    }
}

export const goalController = new GoalController();
