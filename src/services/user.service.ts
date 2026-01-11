import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { sign } from '../utils/jwt';
import { z } from 'zod';
import { createUserSchema, loginSchema } from '../schemas/user.schema';

type CreateUserDTO = z.infer<typeof createUserSchema>;
type LoginDTO = z.infer<typeof loginSchema>;

export class UserService {
    async create(data: CreateUserDTO) {
        const userExists = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (userExists) {
            throw new AppError('User already exists', 409);
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        return user;
    }

    async authenticate(data: LoginDTO) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        const passwordMatch = await bcrypt.compare(data.password, user.password);

        if (!passwordMatch) {
            throw new AppError('Invalid email or password', 401);
        }

        const token = sign({ id: user.id });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            token,
        };
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
            throw new AppError('User not found', 404);
        }

        return user;
    }
}
