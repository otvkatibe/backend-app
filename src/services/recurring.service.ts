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
            where: { id: data.walletId, userId },
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
                    categoryId: data.categoryId,
                },
            });
        } catch (_err: any) {
            throw new Error('Invalid cron expression');
        }
    }

    async processDueTransactions() {
        const now = new Date();
        const dueTransactions = await prisma.recurringTransaction.findMany({
            where: {
                isActive: true,
                nextRun: { lte: now },
            },
        });

        console.log(`[Recurring] Detected ${dueTransactions.length} due transactions.`);

        const results = [];

        for (const recurring of dueTransactions) {
            try {
                const transaction = await this.processSingleTransaction(recurring.id, now);
                if (transaction) {
                    results.push({ id: recurring.id, status: 'success', transactionId: transaction.id });
                } else {
                    // Skipped (already processed)
                    results.push({ id: recurring.id, status: 'skipped' });
                }
            } catch (error: any) {
                console.error(`[Recurring] Failed to process ${recurring.id}:`, error);
                results.push({ id: recurring.id, status: 'failed', error: error.message });
            }
        }

        return results;
    }

    /**
     * Processes a single recurring transaction with idempotency and atomicity checks.
     * @param id RecurringTransaction ID
     * @param executionDate Date of execution
     * @returns The created transaction or null if skipped
     */
    private async processSingleTransaction(id: string, executionDate: Date) {
        return await prisma.$transaction(async (tx) => {
            // 1. Re-fetch transaction (Optimistic Locking / Idempotency Check)
            const freshRecurring = await tx.recurringTransaction.findUnique({
                where: { id },
            });

            // If it disappeared or nextRun was already pushed forward by another process
            if (!freshRecurring || !freshRecurring.isActive || freshRecurring.nextRun > executionDate) {
                return null; // Skip silently (already processed)
            }

            // 2. Create the actual transaction
            const transaction = await tx.transaction.create({
                data: {
                    amount: freshRecurring.amount,
                    type: freshRecurring.type,
                    description: freshRecurring.description || `Recurring: ${freshRecurring.interval}`,
                    date: executionDate,
                    walletId: freshRecurring.walletId,
                    categoryId: freshRecurring.categoryId,
                },
            });

            // 3. Update Wallet Balance
            const adjustment = freshRecurring.type === 'INCOME' ? freshRecurring.amount : freshRecurring.amount.mul(-1);

            await tx.wallet.update({
                where: { id: freshRecurring.walletId },
                data: { balance: { increment: adjustment } },
            });

            // 4. Calculate next run
            const interval = (CronParser as any).parse(freshRecurring.interval, {
                currentDate: executionDate,
                strict: false,
            });
            const nextRun = interval.next().toDate();

            // 5. Update Recurring Record
            await tx.recurringTransaction.update({
                where: { id: freshRecurring.id },
                data: {
                    lastRun: executionDate,
                    nextRun,
                },
            });

            return transaction;
        });
    }

    async list(userId: string) {
        return await prisma.recurringTransaction.findMany({
            where: { wallet: { userId } },
            include: { category: true, wallet: true },
        });
    }

    async cancel(userId: string, id: string) {
        const recurring = await prisma.recurringTransaction.findFirst({
            where: { id, wallet: { userId } },
        });

        if (!recurring) throw new Error('Recurring transaction not found');

        return await prisma.recurringTransaction.update({
            where: { id },
            data: { isActive: false },
        });
    }
}
