import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { validate } from '../middlewares/validateMiddleware';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema';

const categoryRoutes = Router();

categoryRoutes.use(ensureAuthenticated);

categoryRoutes.post('/', validate(createCategorySchema), (req, res, next) => categoryController.create(req, res).catch(next));
categoryRoutes.get('/', (req, res, next) => categoryController.list(req, res).catch(next));
categoryRoutes.get('/:id', (req, res, next) => categoryController.getById(req, res).catch(next));
categoryRoutes.put('/:id', validate(updateCategorySchema), (req, res, next) => categoryController.update(req, res).catch(next));
categoryRoutes.delete('/:id', (req, res, next) => categoryController.delete(req, res).catch(next));

export { categoryRoutes };
