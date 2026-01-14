import { Router } from 'express';
import * as RecurringController from '../controllers/recurring.controller';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const router = Router();

router.use(ensureAuthenticated);

/**
 * @swagger
 * tags:
 *   name: Recurring
 *   description: Recurring transaction management
 */

/**
 * @swagger
 * /recurring:
 *   post:
 *     summary: Create a recurring transaction
 *     tags: [Recurring]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRecurringTransactionDTO'
 *     responses:
 *       201:
 *         description: Recurring transaction created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecurringTransaction'
 */
router.post('/', RecurringController.createRecurring);

/**
 * @swagger
 * /recurring:
 *   get:
 *     summary: List recurring transactions
 *     tags: [Recurring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recurring transactions
 */
router.get('/', RecurringController.listRecurring);

/**
 * @swagger
 * /recurring/{id}:
 *   delete:
 *     summary: Cancel/Delete a recurring transaction
 *     tags: [Recurring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Recurring transaction deleted
 */
router.delete('/:id', RecurringController.cancelRecurring);

export default router;
