import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { validate } from '../middlewares/validateMiddleware';
import { createTransactionSchema, listTransactionsSchema } from '../schemas/transaction.schema';

const transactionRoutes = Router();

transactionRoutes.use(ensureAuthenticated);

transactionRoutes.post('/', validate(createTransactionSchema), (req, res, next) => transactionController.create(req, res).catch(next));
transactionRoutes.get('/', validate(listTransactionsSchema), (req, res, next) => transactionController.list(req, res).catch(next));

export { transactionRoutes };
