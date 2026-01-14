import { Transaction, Prisma } from '@prisma/client';

export interface ITransactionRepository {
    createWithBalanceUpdate(data: Prisma.TransactionUncheckedCreateInput): Promise<Transaction>;
    findMany(options: Prisma.TransactionFindManyArgs): Promise<Transaction[]>;
    count(where: Prisma.TransactionWhereInput): Promise<number>;
    groupByCategory(
        where: Prisma.TransactionWhereInput,
    ): Promise<{ categoryId: string; _sum: { amount: number | null } }[]>;
    sumAmount(where: Prisma.TransactionWhereInput): Promise<number>;
}
