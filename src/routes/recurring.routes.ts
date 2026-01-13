import { Router } from 'express';
import * as RecurringController from '../controllers/recurring.controller';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const router = Router();

router.use(ensureAuthenticated);

router.post('/', RecurringController.createRecurring);
router.get('/', RecurringController.listRecurring);
router.delete('/:id', RecurringController.cancelRecurring);

export default router;
