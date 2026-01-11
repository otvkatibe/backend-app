import express, { type Request, type Response } from 'express';
// Move HealthController import to top
import { HealthController } from './controllers/health.controller';
import { gracefulShutdown } from './utils/shutdown';

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

// Instantiate HealthController
const healthController = new HealthController();
// Bind context to prevent 'this' loss
app.get('/health', healthController.check.bind(healthController));

app.use(userRoute);

app.use(errorHandler);

const server = app.listen(3000, () => {
    logger.info('App running on port 3000');
});

gracefulShutdown(server);
