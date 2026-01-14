import { Budget, Prisma } from "@prisma/client";

export interface IBudgetRepository {
  findMany(
    options: Prisma.BudgetFindManyArgs,
  ): Promise<(Budget & { category?: any })[]>;
  create(data: Prisma.BudgetUncheckedCreateInput): Promise<Budget>;
  update(id: string, data: Prisma.BudgetUpdateInput): Promise<Budget>;
  delete(id: string): Promise<void>;
}
