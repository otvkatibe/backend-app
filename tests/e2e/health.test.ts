import request from 'supertest';
import app from '../../src/app';

describe('E2E Health Check', () => {
    it('should return 200 UP', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('UP');
        expect(res.body.services.database).toBe('UP');
    });
});
