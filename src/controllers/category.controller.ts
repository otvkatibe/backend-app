import { Request, Response } from 'express';
import { categoryService } from '../services/category.service';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../schemas/category.schema';

export class CategoryController {
    async create(req: Request, res: Response) {
        const userId = req.user!.id;
        const data: CreateCategoryDTO = req.body;

        const category = await categoryService.create(userId, data);
        return res.status(201).json(category);
    }

    async list(req: Request, res: Response) {
        const userId = req.user!.id;
        const categories = await categoryService.listByUser(userId);
        return res.json(categories);
    }

    async getById(req: Request, res: Response) {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };

        const category = await categoryService.getById(userId, id);
        return res.json(category);
    }

    async update(req: Request, res: Response) {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };
        const data: UpdateCategoryDTO = req.body;

        const category = await categoryService.update(userId, id, data);
        return res.json(category);
    }

    async delete(req: Request, res: Response) {
        const userId = req.user!.id;
        const { id } = req.params as { id: string };

        await categoryService.delete(userId, id);
        return res.status(204).send();
    }
}

export const categoryController = new CategoryController();
