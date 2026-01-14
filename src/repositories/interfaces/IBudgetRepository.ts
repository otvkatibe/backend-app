import { Budget, Category, Prisma } from '@prisma/client';

export interface IBudgetRepository {
    findMany(options: Prisma.BudgetFindManyArgs): Promise<(Budget & { category?: Category })[]>;
    create(data: Prisma.BudgetUncheckedCreateInput): Promise<Budget>;
    update(id: string, data: Prisma.BudgetUpdateInput): Promise<Budget>;
    delete(id: string): Promise<void>;
}
