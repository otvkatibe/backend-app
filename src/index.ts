import express, { type Request, type Response } from 'express';

import userRoute from './routes/user.route';
import { errorHandler } from './middlewares/errorHandler';
import { globalLimiter } from './middlewares/rateLimiter';
import { requestId } from './middlewares/requestId';
import { requestLogger } from './middlewares/requestLogger';
import { logger } from './utils/logger';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestId);
app.use(requestLogger);
app.use(globalLimiter);

// Health Check Route (Deep Check)
import { HealthController } from './controllers/health.controller';
const healthController = new HealthController();
app.get('/health', healthController.check);

app.use(userRoute);

app.use(errorHandler);

import { gracefullShutdown } from './utils/shutdown';

const server = app.listen(3000, () => {
    logger.info('App running on port 3000');
});

gracefullShutdown(server);
