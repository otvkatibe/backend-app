import { Transaction, Prisma } from '@prisma/client';
import { ITransactionRepository } from '../interfaces/ITransactionRepository';
import { prisma } from '../../utils/prisma';

export class PrismaTransactionRepository implements ITransactionRepository {
    async createWithBalanceUpdate(data: Prisma.TransactionUncheckedCreateInput): Promise<Transaction> {
        return prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data,
            });

            const amountDecimal = new Prisma.Decimal(data.amount as any); // Type assertion needed typically or ensure data.amount is Decimal
            const balanceChange = data.type === 'INCOME' ? amountDecimal : amountDecimal.mul(-1);

            await tx.wallet.update({
                where: { id: data.walletId },
                data: {
                    balance: {
                        increment: balanceChange,
                    },
                },
            });

            return transaction;
        });
    }

    async findMany(options: Prisma.TransactionFindManyArgs): Promise<Transaction[]> {
        return prisma.transaction.findMany(options);
    }

    async count(where: Prisma.TransactionWhereInput): Promise<number> {
        return prisma.transaction.count({ where });
    }

    async groupByCategory(
        where: Prisma.TransactionWhereInput,
    ): Promise<{ categoryId: string; _sum: { amount: number | null } }[]> {
        const result = await prisma.transaction.groupBy({
            by: ['categoryId'],
            where,
            _sum: {
                amount: true,
            },
        });

        return result.map((item) => ({
            categoryId: item.categoryId,
            _sum: { amount: item._sum.amount ? Number(item._sum.amount) : null },
        }));
    }

    async sumAmount(where: Prisma.TransactionWhereInput): Promise<number> {
        const result = await prisma.transaction.aggregate({
            where,
            _sum: { amount: true },
        });
        return result._sum.amount ? Number(result._sum.amount) : 0;
    }
}
