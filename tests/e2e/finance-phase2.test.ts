
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/utils/prisma';
import { clearDatabase } from '../setup';

describe('Modulo Financeiro Fase 2 E2E', () => {
    let token: string;
    let userId: string;
    let categoryId: string;
    let goalId: string;

    beforeAll(async () => {
        // Cleanup
        await clearDatabase();

        // Create User & Login
        const userRes = await request(app).post('/users').send({
            name: 'Test User Phase 2',
            email: 'testphase2@example.com',
            password: 'password123',
            role: 'USER'
        });
        userId = userRes.body.id;

        const loginRes = await request(app).post('/login').send({
            email: 'testphase2@example.com',
            password: 'password123'
        });
        token = loginRes.body.accessToken;

        // Create Category (Dependency for Budget)
        const catRes = await request(app)
            .post('/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Food & Dining' });
        categoryId = catRes.body.id;
    });

    afterAll(async () => {
        // await prisma.$disconnect(); // Keep connection alive for other tests in band
    });

    describe('Orcamentos', () => {
        it('deve criar/atualizar um orcamento', async () => {
            const res = await request(app)
                .post('/budgets')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    categoryId,
                    amount: 1500.00,
                    month: 10,
                    year: 2026
                });

            expect(res.status).toBe(200);
            expect(res.body.amount).toBe("1500"); // Decimal comes as string often
            expect(res.body.categoryId).toBe(categoryId);
        });

        it('deve atualizar o mesmo orcamento (upsert)', async () => {
            const res = await request(app)
                .post('/budgets')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    categoryId,
                    amount: 2000.00, // Increased
                    month: 10,
                    year: 2026
                });

            expect(res.status).toBe(200);
            expect(res.body.amount).toBe("2000"); // Should be updated
        });

        it('deve listar orcamentos com filtros', async () => {
            const res = await request(app)
                .get('/budgets')
                .set('Authorization', `Bearer ${token}`)
                .query({ month: 10, year: 2026 });

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].amount).toBe("2000");
        });
    });

    describe('Metas', () => {
        it('deve criar uma nova meta', async () => {
            const res = await request(app)
                .post('/goals')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'New Car',
                    targetAmount: 50000.00,
                    deadline: '2026-12-31T23:59:59Z'
                });

            expect(res.status).toBe(201);
            expect(res.body.currentAmount).toBe("0");
            goalId = res.body.id;
        });

        it('deve adicionar fundos a meta', async () => {
            const res = await request(app)
                .patch(`/goals/${goalId}/add`)
                .set('Authorization', `Bearer ${token}`)
                .send({ amount: 500.00 });

            expect(res.status).toBe(200);
            expect(res.body.currentAmount).toBe("500");
        });

        it('deve listar metas', async () => {
            const res = await request(app)
                .get('/goals')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            const myGoal = res.body.find((g: any) => g.id === goalId);
            expect(myGoal).toBeDefined();
            expect(myGoal.currentAmount).toBe("500");
        });
    });
});
