import { Router } from 'express';
import { budgetController } from '../controllers/budget.controller';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { validate } from '../middlewares/validateMiddleware';
import { upsertBudgetSchema, listBudgetsSchema } from '../schemas/budget.schema';

const budgetRoutes = Router();

budgetRoutes.use(ensureAuthenticated);

budgetRoutes.post('/', validate(upsertBudgetSchema), (req, res, next) => budgetController.upsert(req, res).catch(next));
budgetRoutes.get('/', validate(listBudgetsSchema), (req, res, next) => budgetController.list(req, res).catch(next));

export { budgetRoutes };
