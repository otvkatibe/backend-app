import { Wallet, Prisma, Transaction } from '@prisma/client';
import { IWalletRepository } from '../interfaces/IWalletRepository';
import { prisma } from '../../utils/prisma';

export class PrismaWalletRepository implements IWalletRepository {
    async create(data: Prisma.WalletUncheckedCreateInput): Promise<Wallet> {
        return prisma.wallet.create({ data });
    }

    async findAllByUserId(userId: string): Promise<(Wallet & { _count: { transactions: number } })[]> {
        return prisma.wallet.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
            include: {
                _count: {
                    select: { transactions: true },
                },
            },
        });
    }

    async findById(id: string): Promise<Wallet | null> {
        return prisma.wallet.findUnique({
            where: { id },
        });
    }

    async findByIdWithRecentTransactions(
        id: string,
        limit: number,
    ): Promise<(Wallet & { transactions: Transaction[] }) | null> {
        return prisma.wallet.findUnique({
            where: { id },
            include: {
                transactions: {
                    take: limit,
                    orderBy: { date: 'desc' },
                },
            },
        });
    }

    async update(id: string, data: Prisma.WalletUpdateInput): Promise<Wallet> {
        return prisma.wallet.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.wallet.delete({
            where: { id },
        });
    }
}
