import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { validate } from '../middlewares/validateMiddleware';
import { createTransactionSchema, listTransactionsSchema } from '../schemas/transaction.schema';

const transactionRoutes = Router();

transactionRoutes.use(ensureAuthenticated);

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction management
 */

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionDTO'
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 */
transactionRoutes.post('/', validate(createTransactionSchema), transactionController.create);

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: List transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of transactions
 */
transactionRoutes.get('/', validate(listTransactionsSchema), transactionController.list);

export { transactionRoutes };
