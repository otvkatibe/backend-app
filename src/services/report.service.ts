import { prisma } from '../utils/prisma';
import { startOfMonth, endOfMonth, parseISO, startOfDay, endOfDay } from 'date-fns';

export class ReportService {
    // 1. Monthly Expenses by Category
    async getMonthlyExpenses(userId: string, month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = endOfMonth(startDate);

        const expenses = await prisma.transaction.groupBy({
            by: ['categoryId'],
            where: {
                wallet: { userId },
                type: 'EXPENSE',
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            _sum: {
                amount: true
            }
        });

        // Enrich with category names
        const result = await Promise.all(expenses.map(async (e) => {
            const category = await prisma.category.findUnique({
                where: { id: e.categoryId }
            });
            return {
                category: category?.name || 'Uncategorized',
                amount: parseFloat(e._sum.amount?.toString() || '0')
            };
        }));

        return result;
    }

    // 2. Cash Flow (Income vs Expense over time)
    async getCashFlow(userId: string, startDateStr: string, endDateStr: string) {
        const startDate = startOfDay(parseISO(startDateStr));
        const endDate = endOfDay(parseISO(endDateStr));

        const transactions = await prisma.transaction.findMany({
            where: {
                wallet: { userId },
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { date: 'asc' }
        });

        // Group by Date (YYYY-MM-DD)
        const daily: Record<string, { income: number, expense: number }> = {};

        transactions.forEach(t => {
            const dateKey = t.date.toISOString().split('T')[0];
            if (!daily[dateKey]) {
                daily[dateKey] = { income: 0, expense: 0 };
            }
            const amount = parseFloat(t.amount.toString());
            if (t.type === 'INCOME') {
                daily[dateKey].income += amount;
            } else {
                daily[dateKey].expense += amount;
            }
        });

        return Object.keys(daily).map(date => ({
            date,
            ...daily[date]
        }));
    }

    // 3. Budget vs Actual
    async getBudgetVsActual(userId: string, month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = endOfMonth(startDate);

        // Get all budgets for the user for this month
        const budgets = await prisma.budget.findMany({
            where: {
                userId,
                month,
                year
            },
            include: { category: true }
        });

        // Calculate actual spend per category
        const report = await Promise.all(budgets.map(async (budget) => {
            const aggregate = await prisma.transaction.aggregate({
                where: {
                    wallet: { userId },
                    categoryId: budget.categoryId,
                    type: 'EXPENSE',
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _sum: { amount: true }
            });

            const actual = parseFloat(aggregate._sum.amount?.toString() || '0');
            const budgeted = parseFloat(budget.amount.toString());

            return {
                category: budget.category.name,
                budgeted,
                actual,
                remaining: budgeted - actual,
                percentUsed: (actual / budgeted) * 100
            };
        }));

        return report;
    }
}
