import { CreateTransactionDTO, ListTransactionsDTO } from '../schemas/transaction.schema';
import { AppError } from '../utils/AppError';
import { ITransactionRepository } from '../repositories/interfaces/ITransactionRepository';
import { IWalletRepository } from '../repositories/interfaces/IWalletRepository';
import { ICategoryRepository } from '../repositories/interfaces/ICategoryRepository';
import { Prisma } from '@prisma/client';

export class TransactionService {
    constructor(
        private transactionRepository: ITransactionRepository,
        private walletRepository: IWalletRepository,
        private categoryRepository: ICategoryRepository,
    ) {}

    /**
     * Cria uma nova transação financeira.
     * Verifica se a carteira e a categoria existem e pertencem ao usuário.
     * Atualiza o saldo da carteira atomicamente via repositório.
     *
     * @param userId ID do usuário autenticado.
     * @param data Dados da transação (valor, tipo, data, etc).
     * @returns A transação criada.
     */
    async create(userId: string, data: CreateTransactionDTO) {
        const { walletId, categoryId } = data;

        // 1. Verificar Propriedade da Carteira
        const wallet = await this.walletRepository.findById(walletId);
        if (!wallet) throw new AppError('Carteira nao encontrada', 404);
        if (wallet.userId !== userId) throw new AppError('Acesso nao autorizado a esta carteira', 403);

        // 2. Verificar Propriedade da Categoria
        const category = await this.categoryRepository.findById(categoryId);
        if (!category) throw new AppError('Categoria nao encontrada', 404);
        if (category.userId !== userId) throw new AppError('Acesso nao autorizado a esta categoria', 403);

        // 3. Executar Transação no Banco
        const transaction = await this.transactionRepository.createWithBalanceUpdate({
            ...data,
            walletId,
            categoryId,
        });

        return transaction;
    }

    /**
     * Lista as transações de um usuário com filtros e paginação.
     *
     * @param userId ID do usuário autenticado.
     * @param filters Filtros de busca (data, carteira, paginação).
     * @returns Lista de transações e metadados de paginação.
     */
    async listByUser(userId: string, filters: ListTransactionsDTO) {
        const page = Number(filters.page) || 1;
        const limit = Number(filters.limit) || 10;
        const skip = (page - 1) * limit;

        const where: Prisma.TransactionWhereInput = {
            wallet: { userId },
            ...(filters.walletId && { walletId: filters.walletId }),
            ...(filters.startDate &&
                filters.endDate && {
                    date: {
                        gte: filters.startDate,
                        lte: filters.endDate,
                    },
                }),
        };

        const transactions = await this.transactionRepository.findMany({
            where,
            skip,
            take: limit,
            orderBy: { date: 'desc' },
            include: {
                wallet: { select: { name: true } },
                category: { select: { name: true } },
            },
        });

        const total = await this.transactionRepository.count(where);

        return {
            data: transactions,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}

import { PrismaTransactionRepository } from '../repositories/prisma/PrismaTransactionRepository';
import { PrismaWalletRepository } from '../repositories/prisma/PrismaWalletRepository';
import { PrismaCategoryRepository } from '../repositories/prisma/PrismaCategoryRepository';

const transactionRepo = new PrismaTransactionRepository();
const walletRepo = new PrismaWalletRepository();
const categoryRepo = new PrismaCategoryRepository();

export const transactionService = new TransactionService(transactionRepo, walletRepo, categoryRepo);
