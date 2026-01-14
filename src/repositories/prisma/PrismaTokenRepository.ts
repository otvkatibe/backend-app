import { RefreshToken, User } from '@prisma/client';
import { ITokenRepository } from '../interfaces/ITokenRepository';
import { prisma } from '../../utils/prisma';

export class PrismaTokenRepository implements ITokenRepository {
    async create(data: { token: string; userId: string; expiresAt: Date }): Promise<RefreshToken> {
        return prisma.refreshToken.create({
            data,
        });
    }

    async findByTokenWithUser(token: string): Promise<(RefreshToken & { user: User }) | null> {
        return prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true },
        });
    }

    async revoke(id: string): Promise<RefreshToken> {
        return prisma.refreshToken.update({
            where: { id },
            data: { revoked: true },
        });
    }

    async deleteExpired(): Promise<number> {
        const { count } = await prisma.refreshToken.deleteMany({
            where: {
                OR: [{ expiresAt: { lt: new Date() } }, { revoked: true }],
            },
        });
        return count;
    }
}
