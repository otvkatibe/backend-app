import bcrypt from 'bcrypt';
import { cacheService } from './cache.service';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { sign, generateAccessToken, generateRefreshToken as genRefreshToken, verify } from '../utils/jwt';
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

        // Generate tokens
        const accessToken = generateAccessToken({ id: user.id, role: user.role });
        const refreshToken = genRefreshToken({ id: user.id, role: user.role });

        // Save refresh token to database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt
            }
        });

        return {
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            accessToken,
            refreshToken
        };
    }

    async refreshToken(token: string) {
        // 1. Verify if token is valid
        try {
            verify(token, true);
        } catch (err) {
            throw new AppError('Refresh token invalido ou expirado', 401);
        }

        // 2. Check in database
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!storedToken) {
            throw new AppError('Refresh token invalido', 401);
        }

        if (storedToken.revoked) {
            // Security: Reuse detection could revoke all tokens here
            throw new AppError('Refresh token revogado', 401);
        }

        // 3. Rotate token
        await prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revoked: true }
        });

        const newAccessToken = generateAccessToken({ id: storedToken.user.id, role: storedToken.user.role });
        const newRefreshToken = genRefreshToken({ id: storedToken.user.id, role: storedToken.user.role });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await prisma.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: storedToken.userId,
                expiresAt
            }
        });

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
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
