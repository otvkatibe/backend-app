import { User, Prisma } from '@prisma/client';
import { IUserRepository } from '../interfaces/IUserRepository';
import { prisma } from '../../utils/prisma';

export class PrismaUserRepository implements IUserRepository {
    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
        });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({
            data,
        });
    }

    async findAll(skip: number, take: number, orderBy: Prisma.UserOrderByWithRelationInput): Promise<User[]> {
        return prisma.user.findMany({
            skip,
            take,
            orderBy,
        });
    }

    async count(): Promise<number> {
        return prisma.user.count();
    }
}
