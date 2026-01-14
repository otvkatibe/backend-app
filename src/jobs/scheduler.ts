import cron from 'node-cron';
import { RecurringTransactionService } from '../services/recurring.service';
import { logger } from '../utils/logger';

import { cacheService } from '../services/cache.service';
import { PrismaTokenRepository } from '../repositories/prisma/PrismaTokenRepository';

const recurringService = new RecurringTransactionService();
const tokenRepository = new PrismaTokenRepository();

export const startScheduler = () => {
    cron.schedule('0 * * * *', async () => {
        const lockKey = 'scheduler:recurring-transactions';
        const acquired = await cacheService.acquireLock(lockKey, 5000);
        if (!acquired) {
            logger.warn('[Scheduler] Skipping recurring transactions (locked)');
            return;
        }

        logger.info('[Scheduler] Checking for recurring transactions...');
        try {
            const results = await recurringService.processDueTransactions();
            const successCount = results.filter((r) => r.status === 'success').length;
            const failCount = results.filter((r) => r.status === 'failed').length;

            if (results.length > 0) {
                logger.info(
                    `[Scheduler] Processed ${results.length} transactions. Success: ${successCount}, Failed: ${failCount}`,
                );
            }
        } catch (error) {
            logger.error('[Scheduler] Error processing recurring transactions', error);
        } finally {
            await cacheService.releaseLock(lockKey);
        }
    });

    cron.schedule('0 0 * * *', async () => {
        const lockKey = 'scheduler:token-cleanup';
        const acquired = await cacheService.acquireLock(lockKey, 10000);
        if (!acquired) {
            logger.warn('[Scheduler] Skipping token cleanup (locked)');
            return;
        }

        logger.info('[Scheduler] Cleaning up expired refresh tokens...');
        try {
            const count = await tokenRepository.deleteExpired();
            if (count > 0) {
                logger.info(`[Scheduler] Deleted ${count} expired/revoked tokens.`);
            }
        } catch (error) {
            logger.error('[Scheduler] Error cleaning up tokens', error);
        } finally {
            await cacheService.releaseLock(lockKey);
        }
    });

    logger.info('[Scheduler] Jobs started: Recurring Transactions (Hourly), Token Cleanup (Daily)');
};
