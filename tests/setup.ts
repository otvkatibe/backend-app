import { prisma } from '../src/utils/prisma';

export const clearDatabase = async () => {
    // Truncate all tables to ensure clean state
    // Use CASCADE to handle foreign keys
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE "transactions", "budgets", "goals", "categories", "wallets", "users" RESTART IDENTITY CASCADE;
    `);
};
