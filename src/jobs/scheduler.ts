import cron from 'node-cron';
import { RecurringTransactionService } from '../services/recurring.service';
import { logger } from '../utils/logger';

const recurringService = new RecurringTransactionService();

export const startScheduler = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        logger.info('[Scheduler] Checking for recurring transactions...');
        try {
            const results = await recurringService.processDueTransactions();
            const successCount = results.filter(r => r.status === 'success').length;
            const failCount = results.filter(r => r.status === 'failed').length;

            if (results.length > 0) {
                logger.info(`[Scheduler] Processed ${results.length} transactions. Success: ${successCount}, Failed: ${failCount}`);
            }
        } catch (error) {
            logger.error('[Scheduler] Error processing recurring transactions', error);
        }
    });

    logger.info('[Scheduler] Job started: Recurring Transactions (Every Hour)');
};
