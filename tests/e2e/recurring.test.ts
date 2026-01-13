import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/utils/prisma';
import { clearDatabase } from '../setup';
import { RecurringTransactionService } from '../../src/services/recurring.service';
import { addDays } from 'date-fns';

const recurringService = new RecurringTransactionService();

describe('E2E Recurring Transactions', () => {
    let token: string;
    let userId: string;
    let walletId: string;
    let categoryId: string;

    const testUser = {
        name: 'Recurring User',
        email: 'recurring@example.com',
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

        // Create Wallet
        const walletRes = await request(app)
            .post('/wallets')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Rec Wallet', balance: 1000 });
        walletId = walletRes.body.id;

        // Create Category
        const catRes = await request(app)
            .post('/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Subs', type: 'EXPENSE' });
        expect(catRes.status).toBe(201);
        categoryId = catRes.body.id;
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('should create a recurring transaction', async () => {
        const res = await request(app)
            .post('/recurring')
            .set('Authorization', `Bearer ${token}`)
            .send({
                amount: 100,
                type: 'EXPENSE',
                description: 'Netflix',
                interval: '0 0 1 * *', // Monthly
                walletId,
                categoryId
            });

        if (res.status !== 201) console.error('Create Error:', res.body);
        expect(res.status).toBe(201);
        expect(res.body.interval).toBe('0 0 1 * *');
        expect(res.body.isActive).toBe(true);
    });

    it('should list recurring transactions', async () => {
        const res = await request(app)
            .get('/recurring')
            .set('Authorization', `Bearer ${token}`);

        if (res.status !== 200) console.error('List Error:', res.body);
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].description).toBe('Netflix');
    });

    it('should process due transactions manually', async () => {
        // Create a transaction due NOW/Yesterday
        // We use service directly to backdate nextRun
        const pastDate = addDays(new Date(), -1);
        await prisma.recurringTransaction.create({
            data: {
                amount: 50,
                type: 'EXPENSE',
                description: 'Due Transaction',
                interval: '0 0 * * *', // Daily
                nextRun: pastDate,
                walletId,
                categoryId
            }
        });

        // Trigger processing
        const results = await recurringService.processDueTransactions();

        // Assert
        expect(results.length).toBeGreaterThanOrEqual(1);
        const processed = results.find(r => r.status === 'success');
        expect(processed).toBeDefined();

        // Check Transaction Created
        const tx = await prisma.transaction.findUnique({ where: { id: processed?.transactionId } });
        expect(tx).toBeDefined();
        expect(tx?.amount.toNumber()).toBe(50);

        // Check Wallet Balance Updated (1000 - 50 = 950)
        // Note: previous tests might have affected balance, so check relative change or ensuring isolation.
        // But since we created a new wallet for this suite... wait, 'Netflix' recurring hasn't run yet.
        // So balance should be 1000 - 50 = 950.
        const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
        expect(wallet?.balance.toNumber()).toBe(950);
    });

    it('should cancel a recurring transaction', async () => {
        const listRes = await request(app).get('/recurring').set('Authorization', `Bearer ${token}`);
        const id = listRes.body[0].id;

        const res = await request(app)
            .delete(`/recurring/${id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(204);

        const check = await prisma.recurringTransaction.findUnique({ where: { id } });
        expect(check?.isActive).toBe(false);
    });
});
