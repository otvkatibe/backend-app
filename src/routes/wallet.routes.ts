import { Router } from 'express';
import { walletController } from '../controllers/wallet.controller';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { validate } from '../middlewares/validateMiddleware';
import { createWalletSchema, updateWalletSchema } from '../schemas/wallet.schema';

const walletRoutes = Router();

walletRoutes.use(ensureAuthenticated);

/**
 * @swagger
 * tags:
 *   name: Wallets
 *   description: Wallet management API
 */

/**
 * @swagger
 * /wallets:
 *   post:
 *     summary: Create a new wallet
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWalletDTO'
 *     responses:
 *       201:
 *         description: The created wallet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
walletRoutes.post('/', validate(createWalletSchema), walletController.create);

/**
 * @swagger
 * /wallets:
 *   get:
 *     summary: List all wallets for the authenticated user
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of wallets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Wallet'
 *       401:
 *         description: Unauthorized
 */
walletRoutes.get('/', walletController.list);

/**
 * @swagger
 * /wallets/{id}:
 *   get:
 *     summary: Get a wallet by ID
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Wallet ID
 *     responses:
 *       200:
 *         description: Wallet details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
 *       404:
 *         description: Wallet not found
 *       401:
 *         description: Unauthorized
 */
walletRoutes.get('/:id', walletController.getById);

/**
 * @swagger
 * /wallets/{id}:
 *   put:
 *     summary: Update a wallet
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Wallet ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWalletDTO'
 *     responses:
 *       200:
 *         description: Updated wallet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
 *       404:
 *         description: Wallet not found
 *       401:
 *         description: Unauthorized
 */
walletRoutes.put('/:id', validate(updateWalletSchema), walletController.update);

/**
 * @swagger
 * /wallets/{id}:
 *   delete:
 *     summary: Delete a wallet
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Wallet ID
 *     responses:
 *       204:
 *         description: Wallet deleted successfully
 *       404:
 *         description: Wallet not found
 *       401:
 *         description: Unauthorized
 */
walletRoutes.delete('/:id', walletController.delete);

export { walletRoutes };
