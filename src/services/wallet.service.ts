import { CreateWalletDTO, UpdateWalletDTO } from '../schemas/wallet.schema';
import { AppError } from '../utils/AppError';
import { IWalletRepository } from '../repositories/interfaces/IWalletRepository';

export class WalletService {
    constructor(private walletRepository: IWalletRepository) {}

    async create(userId: string, data: CreateWalletDTO) {
        const wallet = await this.walletRepository.create({
            ...data,
            userId,
        });
        return wallet;
    }

    async listByUser(userId: string) {
        return this.walletRepository.findAllByUserId(userId);
    }

    async getById(userId: string, walletId: string) {
        const wallet = await this.walletRepository.findByIdWithRecentTransactions(walletId, 5);

        if (!wallet) {
            throw new AppError('Carteira nao encontrada', 404);
        }

        if (wallet.userId !== userId) {
            throw new AppError('Acesso nao autorizado a esta carteira', 403);
        }

        return wallet;
    }

    async update(userId: string, walletId: string, data: UpdateWalletDTO) {
        await this.getById(userId, walletId); // validations included

        return this.walletRepository.update(walletId, data);
    }

    async delete(userId: string, walletId: string) {
        await this.getById(userId, walletId); // validations included

        await this.walletRepository.delete(walletId);
    }
}

import { PrismaWalletRepository } from '../repositories/prisma/PrismaWalletRepository';

const walletRepository = new PrismaWalletRepository();
export const walletService = new WalletService(walletRepository);
