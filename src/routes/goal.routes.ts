import { Router } from 'express';
import { goalController } from '../controllers/goal.controller';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { validate } from '../middlewares/validateMiddleware';
import { createGoalSchema, addFundsSchema } from '../schemas/goal.schema';

const goalRoutes = Router();

goalRoutes.use(ensureAuthenticated);

goalRoutes.post('/', validate(createGoalSchema), (req, res, next) => goalController.create(req, res).catch(next));
goalRoutes.patch('/:id/add', validate(addFundsSchema), (req, res, next) => goalController.addFunds(req, res).catch(next));
goalRoutes.get('/', (req, res, next) => goalController.list(req, res).catch(next));

export { goalRoutes };
