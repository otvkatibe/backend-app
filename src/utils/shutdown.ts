import { Server } from 'http';
import { prisma } from './prisma';
import { logger } from './logger';

// Rename to gracefulShutdown (removed extra 'l')
export const gracefulShutdown = (server: Server) => {
    const shutdown = async (signal: string) => {
        logger.info(`${signal} signal received: closing HTTP server`);

        // Force Shutdown Timeout (25s)
        const forceExit = setTimeout(() => {
            logger.error('Shutdown timeout! Forcing exit.');
            process.exit(1);
        }, 25000);

        server.close(async (err) => {
            if (err) {
                logger.error('Error closing HTTP server', { error: err });
                clearTimeout(forceExit);
                try {
                    await prisma.$disconnect();
                } catch (dbErr) {
                    logger.error('Error disconnecting database', { error: dbErr });
                }
                process.exit(1);
            }

            logger.info('HTTP server closed');
            try {
                await prisma.$disconnect();
                logger.info('Database connection closed');
                clearTimeout(forceExit);
                process.exit(0);
            } catch (err) {
                logger.error('Error during shutdown', { error: err });
                clearTimeout(forceExit);
                process.exit(1);
            }
        });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
};
