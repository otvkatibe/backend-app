import { prisma } from '../utils/prisma';

export class HealthService {
    async checkDatabase(): Promise<boolean> {
        try {
            // Simple query to check connection
            await prisma.$queryRaw`SELECT 1`;
            return true;
        } catch (error) {
            return false;
        }
    }
}
