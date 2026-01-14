import cron from 'node-cron';
import { RecurringTransactionService } from '../services/recurring.service';
import { logger } from '../utils/logger';

import { PrismaTokenRepository } from '../repositories/prisma/PrismaTokenRepository';

const recurringService = new RecurringTransactionService();
const tokenRepository = new PrismaTokenRepository();

export const startScheduler = () => {
    // Run every hour - Recurring Transactions
    cron.schedule('0 * * * *', async () => {
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
        }
    });

    // Run every day at midnight - Token Cleanup
    cron.schedule('0 0 * * *', async () => {
        logger.info('[Scheduler] Cleaning up expired refresh tokens...');
        try {
            const count = await tokenRepository.deleteExpired();
            if (count > 0) {
                logger.info(`[Scheduler] Deleted ${count} expired/revoked tokens.`);
            }
        } catch (error) {
            logger.error('[Scheduler] Error cleaning up tokens', error);
        }
    });

    logger.info('[Scheduler] Jobs started: Recurring Transactions (Hourly), Token Cleanup (Daily)');
};
