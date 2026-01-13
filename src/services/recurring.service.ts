import { prisma } from '../utils/prisma';
import CronParser from 'cron-parser';
import { TransactionType } from '@prisma/client';

interface CreateRecurringDTO {
    amount: number;
    type: TransactionType;
    description?: string;
    interval: string; // Cron expression
    walletId: string;
    categoryId: string;
}

export class RecurringTransactionService {
    async create(userId: string, data: CreateRecurringDTO) {
        // Validate wallet ownership
        const wallet = await prisma.wallet.findUnique({
            where: { id: data.walletId, userId }
        });
        if (!wallet) throw new Error('Wallet not found or access denied');

        // Validate cron expression
        try {
            const interval = (CronParser as any).parse(data.interval, { strict: false });
            const nextRun = interval.next().toDate();

            return await prisma.recurringTransaction.create({
                data: {
                    amount: data.amount,
                    type: data.type,
                    description: data.description,
                    interval: data.interval,
                    nextRun,
                    walletId: data.walletId,
                    categoryId: data.categoryId
                }
            });
        } catch (err: any) {
            throw new Error('Invalid cron expression');
        }
    }

    async processDueTransactions() {
        const now = new Date();
        const dueTransactions = await prisma.recurringTransaction.findMany({
            where: {
                isActive: true,
                nextRun: { lte: now }
            }
        });

        console.log(`[Recurring] Detected ${dueTransactions.length} due transactions.`);

        const results = [];

        for (const recurring of dueTransactions) {
            try {
                // Use a transaction to ensure atomicity
                const result = await prisma.$transaction(async (tx) => {
                    // 1. Create the actual transaction
                    const transaction = await tx.transaction.create({
                        data: {
                            amount: recurring.amount,
                            type: recurring.type,
                            description: recurring.description || `Recurring: ${recurring.interval}`,
                            date: now,
                            walletId: recurring.walletId,
                            categoryId: recurring.categoryId
                        }
                    });

                    // 2. Update Wallet Balance
                    const adjustment = recurring.type === 'INCOME' ? recurring.amount : recurring.amount.mul(-1);
                    await tx.wallet.update({
                        where: { id: recurring.walletId },
                        data: { balance: { increment: adjustment } }
                    });

                    // 3. Calculate next run
                    const interval = (CronParser as any).parse(recurring.interval, { currentDate: now, strict: false });
                    const nextRun = interval.next().toDate();

                    // 4. Update Recurring Record
                    await tx.recurringTransaction.update({
                        where: { id: recurring.id },
                        data: {
                            lastRun: now,
                            nextRun
                        }
                    });

                    return transaction;
                });
                results.push({ id: recurring.id, status: 'success', transactionId: result.id });
            } catch (error: any) {
                console.error(`[Recurring] Failed to process ${recurring.id}:`, error);
                results.push({ id: recurring.id, status: 'failed', error: error.message });
            }
        }

        return results;
    }

    async list(userId: string) {
        return await prisma.recurringTransaction.findMany({
            where: { wallet: { userId } },
            include: { category: true, wallet: true }
        });
    }

    async cancel(userId: string, id: string) {
        const recurring = await prisma.recurringTransaction.findFirst({
            where: { id, wallet: { userId } }
        });

        if (!recurring) throw new Error('Recurring transaction not found');

        return await prisma.recurringTransaction.update({
            where: { id },
            data: { isActive: false }
        });
    }
}
