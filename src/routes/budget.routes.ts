import { Router } from 'express';
import { budgetController } from '../controllers/budget.controller';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { validate } from '../middlewares/validateMiddleware';
import { upsertBudgetSchema, listBudgetsSchema } from '../schemas/budget.schema';

const budgetRoutes = Router();

budgetRoutes.use(ensureAuthenticated);

/**
 * @swagger
 * tags:
 *   name: Budgets
 *   description: Budget management
 */

/**
 * @swagger
 * /budgets:
 *   post:
 *     summary: Create or update budget (Upsert)
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpsertBudgetDTO'
 *     responses:
 *       200:
 *         description: Budget created/updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Budget'
 */
budgetRoutes.post('/', validate(upsertBudgetSchema), budgetController.upsert);

/**
 * @swagger
 * /budgets:
 *   get:
 *     summary: List budgets
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: List of budgets
 */
budgetRoutes.get('/', validate(listBudgetsSchema), budgetController.list);

export { budgetRoutes };
