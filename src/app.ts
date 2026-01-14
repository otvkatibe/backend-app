import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { HealthController } from './controllers/health.controller';
import userRoute from './routes/user.route';
import { walletRoutes } from './routes/wallet.routes';
import { categoryRoutes } from './routes/category.routes';
import { transactionRoutes } from './routes/transaction.routes';
import { budgetRoutes } from './routes/budget.routes';
import { goalRoutes } from './routes/goal.routes';
import reportRoutes from './routes/report.routes';
import recurringRoutes from './routes/recurring.routes';
import { errorHandler } from './middlewares/errorHandler';
import { globalLimiter } from './middlewares/rateLimiter';
import { requestId } from './middlewares/requestId';
import { requestLogger } from './middlewares/requestLogger';

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    }),
);

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
app.use('/wallets', walletRoutes);
app.use('/categories', categoryRoutes);
app.use('/transactions', transactionRoutes);
app.use('/budgets', budgetRoutes);
app.use('/goals', goalRoutes);
app.use('/reports', reportRoutes);
app.use('/recurring', recurringRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

export default app;
