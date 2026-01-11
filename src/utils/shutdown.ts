import { Server } from 'http';
import { prisma } from './prisma';
import { logger } from './logger';

export const gracefullShutdown = (server: Server) => {
    const shutdown = async (signal: string) => {
        logger.info(`${signal} signal received: closing HTTP server`);

        server.close(async () => {
            logger.info('HTTP server closed');
            try {
                await prisma.$disconnect();
                logger.info('Database connection closed');
                process.exit(0);
            } catch (err) {
                logger.error('Error during shutdown', { error: err });
                process.exit(1);
            }
        });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
};
