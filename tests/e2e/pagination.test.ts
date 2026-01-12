import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/utils/prisma';
import jwt from 'jsonwebtoken';
import { clearDatabase } from '../setup';

describe('E2E Pagination', () => {

    // Admin user for authentication (endpoint is protected)
    const adminUser = {
        name: 'Admin Paginator',
        email: 'admin@pagination.com',
        password: 'password123',
        role: 'ADMIN'
    };

    let adminToken: string;

    beforeAll(async () => {
        // Cleanup
        await clearDatabase();

        // 1. Create Admin
        await request(app).post('/users').send(adminUser);
        await prisma.user.update({
            where: { email: adminUser.email },
            data: { role: 'ADMIN' }
        });

        // 2. Login Admin
        const loginRes = await request(app).post('/login').send({
            email: adminUser.email,
            password: adminUser.password
        });
        adminToken = loginRes.body.token;

        // 3. Seed 20 Users for pagination testing
        const usersToCreate = [];
        for (let i = 1; i <= 20; i++) {
            usersToCreate.push({
                name: `User ${i}`,
                email: `user${i}@pagination.com`,
                password: 'password123',
                role: 'USER'
            });
        }
        await prisma.user.createMany({ data: usersToCreate });
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('should return 10 items by default', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(10);
        expect(res.body.meta.limit).toBe(10);
        expect(res.body.meta.page).toBe(1);
    });

    it('should return 5 items when limit is 5', async () => {
        const res = await request(app)
            .get('/users?limit=5')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(5);
        expect(res.body.meta.limit).toBe(5);
    });

    it('should return the second page of items', async () => {
        const res = await request(app)
            .get('/users?page=2&limit=5')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(5);
        expect(res.body.meta.page).toBe(2);
        // Ensure data is different from page 1 strictly? 
        // We know we inserted in order, but DB order isn't guaranteed without sort.
        // Our controller implements default sort? Yes, check controller...
    });

    it('should return correct total metadata', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${adminToken}`);

        // Total should be 21 (20 seeded + 1 admin)
        expect(res.body.meta.total).toBe(21);
        expect(res.body.meta.totalPages).toBe(3); // 10 + 10 + 1
    });
});
