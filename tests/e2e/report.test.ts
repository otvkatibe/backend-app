import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/utils/prisma';
import { clearDatabase } from '../setup';
import { subMonths, startOfMonth, format } from 'date-fns';

describe('E2E Reports', () => {
    let token: string;
    let userId: string;
    let categoryId: string;

    const testUser = {
        name: 'Report User',
        email: 'report@example.com',
        password: 'password123',
        role: 'USER'
    };

    beforeAll(async () => {
        await clearDatabase();

        // Register User
        const userRes = await request(app).post('/users').send(testUser);
        userId = userRes.body.id;

        // Login
        const loginRes = await request(app).post('/login').send({
            email: testUser.email,
            password: testUser.password
        });
        token = loginRes.body.token;

        // Create Category
        const catRes = await request(app)
            .post('/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Food' });
        categoryId = catRes.body.id;


        // Create Transactions (Last Month and This Month)
        const now = new Date();
        const lastMonth = subMonths(now, 1);

        // Expense Last Month
        await prisma.transaction.create({
            data: {
                amount: 100,
                type: 'EXPENSE',
                date: lastMonth,
                description: 'Lunch last month',
                category: { connect: { id: categoryId } },
                wallet: {
                    create: { name: 'Main Wallet', userId, balance: 1000 }
                }
            }
        });

        // Expense This Month
        await prisma.transaction.create({
            data: {
                amount: 50,
                type: 'EXPENSE',
                date: now,
                description: 'Lunch today',
                categoryId,
                walletId: (await prisma.wallet.findFirst({ where: { userId } }))!.id
            }
        });

        // Create Budget for This Month
        await request(app)
            .post('/budgets')
            .set('Authorization', `Bearer ${token}`)
            .send({
                categoryId,
                amount: 200,
                month: now.getMonth() + 1,
                year: now.getFullYear()
            });
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('should get monthly expenses', async () => {
        const now = new Date();
        const res = await request(app)
            .get('/reports/monthly-expenses')
            .query({ month: now.getMonth() + 1, year: now.getFullYear() })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        const foodExpense = res.body.find((e: any) => e.category === 'Food');
        expect(foodExpense).toBeDefined();
        expect(foodExpense.amount).toBe(50);
    });

    it('should get cash flow', async () => {
        const now = new Date();
        const start = startOfMonth(now).toISOString();
        const end = now.toISOString();

        const res = await request(app)
            .get('/reports/cash-flow')
            .query({ startDate: start, endDate: end })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get budget vs actual', async () => {
        const now = new Date();
        const res = await request(app)
            .get('/reports/budget-vs-actual')
            .query({ month: now.getMonth() + 1, year: now.getFullYear() })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        const report = res.body[0];
        expect(report.category).toBe('Food');
        expect(report.budgeted).toBe(200);
        expect(report.actual).toBe(50);
        expect(report.remaining).toBe(150);
        expect(report.percentUsed).toBe(25);
    });

    it('should export report as CSV', async () => {
        const now = new Date();
        const res = await request(app)
            .get('/reports/export')
            .query({
                type: 'monthly-expenses',
                format: 'csv',
                month: now.getMonth() + 1,
                year: now.getFullYear()
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.header['content-type']).toBe('text/csv; charset=utf-8');
        expect(res.text).toContain('"category","amount"');
        expect(res.text).toContain('"Food",50');
    });
});
