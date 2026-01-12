import { prisma } from '../utils/prisma';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../schemas/category.schema';
import { AppError } from '../utils/AppError';
import { Category } from '@prisma/client';

export class CategoryService {
    async create(userId: string, data: CreateCategoryDTO): Promise<Category> {
        const category = await prisma.category.create({
            data: {
                ...data,
                userId,
            },
        });
        return category;
    }

    async listByUser(userId: string): Promise<Category[]> {
        return prisma.category.findMany({
            where: { userId },
            orderBy: { name: 'asc' },
        });
    }

    async getById(userId: string, categoryId: string): Promise<Category> {
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            throw new AppError('Category not found', 404);
        }

        if (category.userId !== userId) {
            throw new AppError('Unauthorized access to this category', 403);
        }

        return category;
    }

    async update(userId: string, categoryId: string, data: UpdateCategoryDTO): Promise<Category> {
        await this.getById(userId, categoryId); // validations included

        return prisma.category.update({
            where: { id: categoryId },
            data,
        });
    }

    async delete(userId: string, categoryId: string): Promise<void> {
        await this.getById(userId, categoryId); // validations included

        await prisma.category.delete({
            where: { id: categoryId },
        });
    }
}

export const categoryService = new CategoryService();
