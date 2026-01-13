import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/utils/prisma';
import { clearDatabase } from '../setup';

describe('E2E RBAC', () => {

    const adminUser = {
        name: 'Admin User',
        email: 'admin@rbac.com',
        password: 'password123'
    };

    const regularUser = {
        name: 'Regular User',
        email: 'user@rbac.com',
        password: 'password123'
    };

    let adminToken: string;
    let userToken: string;

    beforeAll(async () => {
        // Cleanup potential leftovers
        await clearDatabase();

        // 1. Register Admin User
        await request(app).post('/users').send(adminUser);

        // 2. Promote to ADMIN directly in DB (bypass API)
        await prisma.user.update({
            where: { email: adminUser.email },
            data: { role: 'ADMIN' }
        });

        // 3. Register Regular User
        await request(app).post('/users').send(regularUser);

        // 4. Login Admin
        const adminLogin = await request(app).post('/login').send({
            email: adminUser.email,
            password: adminUser.password
        });
        adminToken = adminLogin.body.accessToken;

        // 5. Login Regular User
        const userLogin = await request(app).post('/login').send({
            email: regularUser.email,
            password: regularUser.password
        });
        userToken = userLogin.body.accessToken;
    });

    afterAll(async () => {
        await clearDatabase();
    });

    describe('GET /users (Admin Route)', () => {
        it('should allow access to ADMIN', async () => {
            const res = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should deny access to regular USER', async () => {
            const res = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(403);
        });

        it('should deny access without token', async () => {
            const res = await request(app)
                .get('/users');

            expect(res.status).toBe(401);
        });
    });
});
