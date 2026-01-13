import { Router } from 'express';
import { goalController } from '../controllers/goal.controller';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { validate } from '../middlewares/validateMiddleware';
import { createGoalSchema, addFundsSchema } from '../schemas/goal.schema';

const goalRoutes = Router();

goalRoutes.use(ensureAuthenticated);

/**
 * @swagger
 * tags:
 *   name: Goals
 *   description: Financial goals management
 */

/**
 * @swagger
 * /goals:
 *   post:
 *     summary: Create a new goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGoalDTO'
 *     responses:
 *       201:
 *         description: Goal created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Goal'
 */
goalRoutes.post('/', validate(createGoalSchema), goalController.create);

/**
 * @swagger
 * /goals/{id}/add:
 *   patch:
 *     summary: Add funds to a goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddFundsDTO'
 *     responses:
 *       200:
 *         description: Funds added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Goal'
 */
goalRoutes.patch('/:id/add', validate(addFundsSchema), goalController.addFunds);

/**
 * @swagger
 * /goals:
 *   get:
 *     summary: List goals
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of goals
 */
goalRoutes.get('/', goalController.list);

export { goalRoutes };
