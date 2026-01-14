import bcrypt from 'bcrypt';
import { cacheService } from './cache.service';
import { AppError } from '../utils/AppError';
import { generateAccessToken, generateRefreshToken as genRefreshToken, verify } from '../utils/jwt';
import { z } from 'zod';
import { createUserSchema, loginSchema } from '../schemas/user.schema';
import { calculatePagination } from '../utils/prismaHelper';
import { PaginationOptions, PaginatedResult } from '../types/PaginationTypes';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { ITokenRepository } from '../repositories/interfaces/ITokenRepository';

type CreateUserDTO = z.infer<typeof createUserSchema>;
type LoginDTO = z.infer<typeof loginSchema>;

export class UserService {
    constructor(
        private userRepository: IUserRepository,
        private tokenRepository: ITokenRepository,
    ) {}

    async create(data: CreateUserDTO) {
        const userExists = await this.userRepository.findByEmail(data.email);

        if (userExists) {
            throw new AppError('Usuario ja existe', 409);
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await this.userRepository.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: 'USER',
        });

        // Invalidate list cache
        await cacheService.del('users:list:*');

        const { password: _password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async authenticate(data: LoginDTO) {
        const user = await this.userRepository.findByEmail(data.email);

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

        await this.tokenRepository.create({
            token: refreshToken,
            userId: user.id,
            expiresAt,
        });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            accessToken,
            refreshToken,
        };
    }

    async refreshToken(token: string) {
        // 1. Verify if token is valid
        try {
            verify(token, true);
        } catch (_err) {
            throw new AppError('Refresh token invalido ou expirado', 401);
        }

        // 2. Check in database
        const storedToken = await this.tokenRepository.findByTokenWithUser(token);

        if (!storedToken) {
            throw new AppError('Refresh token invalido', 401);
        }

        if (storedToken.revoked) {
            throw new AppError('Refresh token revogado', 401);
        }

        // 3. Rotate token
        await this.tokenRepository.revoke(storedToken.id);

        const newAccessToken = generateAccessToken({
            id: storedToken.user.id,
            role: storedToken.user.role,
        });
        const newRefreshToken = genRefreshToken({
            id: storedToken.user.id,
            role: storedToken.user.role,
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.tokenRepository.create({
            token: newRefreshToken,
            userId: storedToken.userId,
            expiresAt,
        });

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }

    async getProfile(userId: string) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new AppError('Usuario nao encontrado', 404);
        }

        // Manually sanitize since we don't have 'select' in repository generic findById
        // Ideally repository findById should handle selection or we map here.
        // For now, simpler:
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    async listAll(options: PaginationOptions) {
        const cacheKey = `users:list:${JSON.stringify(options)}`;
        const cached = await cacheService.get<any>(cacheKey);

        if (cached) {
            return cached;
        }

        const { skip, take, page, limit } = calculatePagination(options);

        // Transaction handling for consistency is trickier with repositories unless we expose transaction manager.
        // For 'list' + 'count', strict consistency is rarely critical in this context versus just calling them.
        // We will call them separately for now to avoid exposing Prisma transaction types in interface.
        const users = await this.userRepository.findAll(skip, take, {
            name: options.order === 'desc' ? 'desc' : 'asc',
        });
        const total = await this.userRepository.count();

        const totalPages = Math.ceil(total / limit);

        // Sanitization
        const sanitizedUsers = users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            createdAt: u.createdAt,
        }));

        const result: PaginatedResult<(typeof sanitizedUsers)[0]> = {
            data: sanitizedUsers,
            meta: {
                total,
                page,
                limit,
                totalPages,
            },
        };

        // Set cache for 60 seconds
        await cacheService.set(cacheKey, result, 60);

        return result;
    }
}
