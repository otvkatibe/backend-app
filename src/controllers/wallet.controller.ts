import { Request, Response } from 'express';
import { walletService } from '../services/wallet.service';
import { CreateWalletDTO, UpdateWalletDTO } from '../schemas/wallet.schema';

export class WalletController {
    async create(req: Request, res: Response) {
        const userId = req.user!.id;
        const data: CreateWalletDTO = req.body;

        const wallet = await walletService.create(userId, data);
        return res.status(201).json(wallet);
    }

    async list(req: Request, res: Response) {
        const userId = req.user!.id;
        const wallets = await walletService.listByUser(userId);
        return res.json(wallets);
    }

    async getById(req: Request, res: Response) {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };

        const wallet = await walletService.getById(userId, id);
        return res.json(wallet);
    }

    async update(req: Request, res: Response) {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };
        const data: UpdateWalletDTO = req.body;

        const wallet = await walletService.update(userId, id, data);
        return res.json(wallet);
    }

    async delete(req: Request, res: Response) {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };

        await walletService.delete(userId, id);
        return res.status(204).send();
    }
}

export const walletController = new WalletController();
