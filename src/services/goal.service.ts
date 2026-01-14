import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { Goal } from '@prisma/client';

interface CreateGoalDTO {
    name: string;
    targetAmount: number;
    deadline?: string;
}

export class GoalService {
    async create(userId: string, data: CreateGoalDTO): Promise<Goal> {
        return prisma.goal.create({
            data: {
                ...data,
                userId,
            },
        });
    }

    async addFunds(userId: string, goalId: string, amount: number): Promise<Goal> {
        const goal = await prisma.goal.findUnique({ where: { id: goalId } });
        if (!goal) throw new AppError('Meta nao encontrada', 404);
        if (goal.userId !== userId) throw new AppError('Acesso nao autorizado a esta meta', 403);

        return prisma.goal.update({
            where: { id: goalId },
            data: {
                currentAmount: { increment: amount },
            },
        });
    }

    async list(userId: string) {
        return prisma.goal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
}

export const goalService = new GoalService();
