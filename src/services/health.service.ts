import { prisma } from '../utils/prisma';
import { cacheService } from './cache.service';

export class HealthService {
    async checkDatabase(): Promise<boolean> {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return true;
        } catch (_error) {
            return false;
        }
    }

    async checkRedis(): Promise<boolean> {
        try {
            const client = cacheService.getRedisClient();
            if (client.status !== 'ready') return false;
            const pong = await client.ping();
            return pong === 'PONG';
        } catch (_error) {
            return false;
        }
    }
}
