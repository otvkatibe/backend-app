import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/utils/prisma';
import { clearDatabase } from '../setup';

describe('E2E Auth', () => {

    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'USER'
    };

    beforeAll(async () => {
        // Cleanup before tests
        await clearDatabase();
    });

    afterAll(async () => {
        // Cleanup after tests
        await clearDatabase();
        // await prisma.$disconnect();
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
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
    });

    it('should refresh access token', async () => {
        // 1. Login to get refresh token
        const loginRes = await request(app)
            .post('/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        const { refreshToken } = loginRes.body;

        // 2. Use refresh token to get new access token
        const refreshRes = await request(app)
            .post('/auth/refresh-token')
            .send({ refreshToken });

        expect(refreshRes.status).toBe(200);
        expect(refreshRes.body).toHaveProperty('accessToken');
        expect(refreshRes.body).toHaveProperty('refreshToken');
        expect(refreshRes.body.accessToken).not.toBe(loginRes.body.accessToken); // Should be rotated/new
    });

    it('should fail refresh with invalid token', async () => {
        const res = await request(app)
            .post('/auth/refresh-token')
            .send({ refreshToken: 'invalid_token' });

        expect(res.status).toBe(401);
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
