import { prisma } from '../utils/prisma';
import { CreateWalletDTO, UpdateWalletDTO } from '../schemas/wallet.schema';
import { AppError } from '../utils/AppError';
import { Wallet } from '@prisma/client';

export class WalletService {
    async create(userId: string, data: CreateWalletDTO): Promise<Wallet> {
        const wallet = await prisma.wallet.create({
            data: {
                ...data,
                userId,
            },
        });
        return wallet;
    }

    async listByUser(userId: string): Promise<Wallet[]> {
        return prisma.wallet.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
            include: {
                _count: {
                    select: { transactions: true }
                }
            }
        });
    }

    async getById(userId: string, walletId: string): Promise<Wallet> {
        const wallet = await prisma.wallet.findUnique({
            where: { id: walletId },
            include: {
                transactions: {
                    take: 5,
                    orderBy: { date: 'desc' }
                }
            }
        });

        if (!wallet) {
            throw new AppError('Wallet not found', 404);
        }

        if (wallet.userId !== userId) {
            throw new AppError('Unauthorized access to this wallet', 403);
        }

        return wallet;
    }

    async update(userId: string, walletId: string, data: UpdateWalletDTO): Promise<Wallet> {
        const wallet = await this.getById(userId, walletId); // validations included

        return prisma.wallet.update({
            where: { id: walletId },
            data,
        });
    }

    async delete(userId: string, walletId: string): Promise<void> {
        await this.getById(userId, walletId); // validations included

        await prisma.wallet.delete({
            where: { id: walletId },
        });
    }
}

export const walletService = new WalletService();
