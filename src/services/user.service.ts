import bcrypt from 'bcrypt';
import { cacheService } from './cache.service';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { sign } from '../utils/jwt';
import { z } from 'zod';
import { createUserSchema, loginSchema } from '../schemas/user.schema';
import { calculatePagination } from '../utils/prismaHelper';
import { PaginationOptions, PaginatedResult } from '../types/PaginationTypes';

type CreateUserDTO = z.infer<typeof createUserSchema>;
type LoginDTO = z.infer<typeof loginSchema>;

export class UserService {
    async create(data: CreateUserDTO) {
        const userExists = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (userExists) {
            throw new AppError('Usuario ja existe', 409);
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: 'USER' // Default role
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        // Invalidate list cache
        await cacheService.del('users:list:*');

        return user;
    }

    async authenticate(data: LoginDTO) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw new AppError('Email ou senha invalidos', 401);
        }

        const validPassword = await bcrypt.compare(data.password, user.password);

        if (!validPassword) {
            throw new AppError('Email ou senha invalidos', 401);
        }

        const token = sign({ id: user.id, role: user.role });

        return { user, token };
    }

    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new AppError('Usuario nao encontrado', 404);
        }

        return user;
    }

    async listAll(options: PaginationOptions) {
        const cacheKey = `users:list:${JSON.stringify(options)}`;
        const cached = await cacheService.get<any>(cacheKey);

        if (cached) {
            return cached;
        }

        const { skip, take, page, limit } = calculatePagination(options);

        // Transaction to ensure consistency between data and count
        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                skip,
                take,
                orderBy: {
                    name: options.order === 'desc' ? 'desc' : 'asc'
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true
                }
            }),
            prisma.user.count()
        ]);

        const totalPages = Math.ceil(total / limit);

        const result: PaginatedResult<typeof users[0]> = {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages
            }
        };

        // Set cache for 60 seconds
        await cacheService.set(cacheKey, result, 60);

        return result;
    }
}
