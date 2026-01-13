import { prisma } from '../utils/prisma';
import { CreateTransactionDTO, ListTransactionsDTO } from '../schemas/transaction.schema';
import { AppError } from '../utils/AppError';
import { Transaction, Prisma } from '@prisma/client';


export class TransactionService {
    async create(userId: string, data: CreateTransactionDTO): Promise<Transaction> {
        const { walletId, categoryId, amount, type, date, description } = data;

        // 1. Verify Wallet Ownership
        const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
        if (!wallet) throw new AppError('Carteira nao encontrada', 404);
        if (wallet.userId !== userId) throw new AppError('Acesso nao autorizado a esta carteira', 403);

        // 2. Verify Category Ownership
        const category = await prisma.category.findUnique({ where: { id: categoryId } });
        if (!category) throw new AppError('Categoria nao encontrada', 404);
        if (category.userId !== userId) throw new AppError('Acesso nao autorizado a esta categoria', 403);

        // 3. Execute Transaction Atomically (Create Transaction + Update Wallet Balance)
        // Extracting type directly from the transaction method to ensure compatibility
        type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

        const result = await prisma.$transaction(async (tx: any) => {
            const transaction = await tx.transaction.create({
                data: {
                    amount,
                    type,
                    date,
                    description,
                    walletId,
                    categoryId,
                },
            });

            // Use Prisma.Decimal to avoid floating point errors
            const amountDecimal = new Prisma.Decimal(amount);
            const balanceChange = type === 'INCOME' ? amountDecimal : amountDecimal.mul(-1);

            await tx.wallet.update({
                where: { id: walletId },
                data: {
                    balance: {
                        increment: balanceChange,
                    },
                },
            });

            return transaction;
        });

        return result;
    }

    async listByUser(userId: string, filters: ListTransactionsDTO) {
        const page = Number(filters.page) || 1;
        const limit = Number(filters.limit) || 10;
        const skip = (page - 1) * limit;

        const where = {
            wallet: { userId }, // Indirect check via relations
            ...(filters.walletId && { walletId: filters.walletId }),
            ...(filters.startDate && filters.endDate && {
                date: {
                    gte: filters.startDate,
                    lte: filters.endDate,
                }
            })
        };

        const [transactions, total] = await prisma.$transaction([
            prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: 'desc' },
                include: {
                    wallet: { select: { name: true } },
                    category: { select: { name: true } }
                }
            }),
            prisma.transaction.count({ where })
        ]);

        return {
            data: transactions,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}

export const transactionService = new TransactionService();
