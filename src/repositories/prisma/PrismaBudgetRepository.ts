import { Budget, Category, Prisma } from '@prisma/client';
import { IBudgetRepository } from '../interfaces/IBudgetRepository';
import { prisma } from '../../utils/prisma';

export class PrismaBudgetRepository implements IBudgetRepository {
    async findMany(options: Prisma.BudgetFindManyArgs): Promise<(Budget & { category?: Category })[]> {
        return prisma.budget.findMany(options);
    }

    async create(data: Prisma.BudgetUncheckedCreateInput): Promise<Budget> {
        return prisma.budget.create({ data });
    }

    async update(id: string, data: Prisma.BudgetUpdateInput): Promise<Budget> {
        return prisma.budget.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.budget.delete({
            where: { id },
        });
    }
}
