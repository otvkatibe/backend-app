import { Request, Response } from 'express';
import { transactionService } from '../services/transaction.service';
import { CreateTransactionDTO, ListTransactionsDTO } from '../schemas/transaction.schema';

export class TransactionController {
    async create(req: Request, res: Response) {
        const userId = req.user!.id;
        const data: CreateTransactionDTO = req.body;

        const transaction = await transactionService.create(userId, data);
        return res.status(201).json(transaction);
    }

    async list(req: Request, res: Response) {
        const userId = req.user!.id;
        // Cast query params to expected type (Zod middleware validates structure, but types need checking)
        const filters = req.query as unknown as ListTransactionsDTO;

        const result = await transactionService.listByUser(userId, filters);
        return res.json(result);
    }
}

export const transactionController = new TransactionController();
