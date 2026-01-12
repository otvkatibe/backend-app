import app from './app';
import { logger } from './utils/logger';
import { gracefulShutdown } from './utils/shutdown';

const PORT = 3000;

const server = app.listen(PORT, async () => {
    await import('./services/cache.service').then(({ cacheService }) => cacheService.connect());
    logger.info(`App running on port ${PORT}`);
    logger.info(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});

gracefulShutdown(server);
