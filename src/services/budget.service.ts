import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { Budget } from '@prisma/client';

interface UpsertBudgetDTO {
    categoryId: string;
    amount: number;
    month: number;
    year: number;
}

interface ListBudgetsDTO {
    month?: number;
    year?: number;
    page?: number;
    limit?: number;
}

export class BudgetService {
    async upsert(userId: string, data: UpsertBudgetDTO): Promise<Budget> {
        const { categoryId, amount, month, year } = data;

        // Verify Category Ownership
        const category = await prisma.category.findUnique({ where: { id: categoryId } });
        if (!category) throw new AppError('Categoria nao encontrada', 404);
        if (category.userId !== userId) throw new AppError('Acesso nao autorizado a esta categoria', 403);

        const budget = await prisma.budget.upsert({
            where: {
                userId_categoryId_month_year: {
                    userId,
                    categoryId,
                    month,
                    year,
                },
            },
            update: { amount },
            create: {
                userId,
                categoryId,
                amount,
                month,
                year,
            },
        });

        return budget;
    }

    async list(userId: string, filters: ListBudgetsDTO) {
        const page = Number(filters.page) || 1;
        const limit = Number(filters.limit) || 10;
        const skip = (page - 1) * limit;

        const where = {
            userId,
            ...(filters.month && { month: filters.month }),
            ...(filters.year && { year: filters.year }),
        };

        const [budgets, total] = await prisma.$transaction([
            prisma.budget.findMany({
                where,
                skip,
                take: limit,
                include: { category: { select: { name: true } } },
                orderBy: [{ year: 'desc' }, { month: 'desc' }],
            }),
            prisma.budget.count({ where }),
        ]);

        return {
            data: budgets,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}

export const budgetService = new BudgetService();
