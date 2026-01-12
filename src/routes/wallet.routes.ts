
import { Router } from 'express';
import { walletController } from '../controllers/wallet.controller';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { validate } from '../middlewares/validateMiddleware';
import { createWalletSchema, updateWalletSchema } from '../schemas/wallet.schema';

const walletRoutes = Router();

walletRoutes.use(ensureAuthenticated);

walletRoutes.post('/', validate(createWalletSchema), (req, res, next) => walletController.create(req, res).catch(next));
walletRoutes.get('/', (req, res, next) => walletController.list(req, res).catch(next));
walletRoutes.get('/:id', (req, res, next) => walletController.getById(req, res).catch(next));
walletRoutes.put('/:id', validate(updateWalletSchema), (req, res, next) => walletController.update(req, res).catch(next));
walletRoutes.delete('/:id', (req, res, next) => walletController.delete(req, res).catch(next));

export { walletRoutes };
