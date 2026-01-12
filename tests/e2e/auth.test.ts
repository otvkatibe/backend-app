import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/utils/prisma';

describe('E2E Auth', () => {

    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'USER'
    };

    beforeAll(async () => {
        // Cleanup before tests
        await prisma.user.deleteMany({ where: { email: testUser.email } });
    });

    afterAll(async () => {
        // Cleanup after tests
        await prisma.user.deleteMany({ where: { email: testUser.email } });
        await prisma.$disconnect();
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/users')
            .send(testUser);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toBe(testUser.email);
    });

    it('should authenticate the user', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should fail login with wrong password', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                email: testUser.email,
                password: 'wrongpassword'
            });

        expect(res.status).toBe(401);
    });
});
