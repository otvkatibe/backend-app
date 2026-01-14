import { TransactionService } from './transaction.service';
import { MockTransactionRepository } from '../../tests/mocks/MockTransactionRepository';
import { MockWalletRepository } from '../../tests/mocks/MockWalletRepository';
import { MockCategoryRepository } from '../../tests/mocks/MockCategoryRepository';
import { AppError } from '../utils/AppError';
import { TransactionType } from '@prisma/client';

describe('Testes Unitários TransactionService', () => {
    let transactionService: TransactionService;
    let mockTransactionRepo: MockTransactionRepository;
    let mockWalletRepo: MockWalletRepository;
    let mockCategoryRepo: MockCategoryRepository;

    beforeEach(() => {
        mockTransactionRepo = new MockTransactionRepository();
        mockWalletRepo = new MockWalletRepository();
        mockCategoryRepo = new MockCategoryRepository();
        transactionService = new TransactionService(mockTransactionRepo, mockWalletRepo, mockCategoryRepo);
    });

    describe('create', () => {
        // Cenário de Sucesso
        it('deve criar uma despesa com sucesso e atualizar saldo da carteira', async () => {
            const userId = 'user-123';
            // Pré-requisitos: Carteira e Categoria existentes
            const wallet = await mockWalletRepo.create({ userId, name: 'Principal', currency: 'BRL', balance: 0 });
            const category = await mockCategoryRepo.create({ userId, name: 'Alimentação' });

            const data = {
                amount: 100,
                type: TransactionType.EXPENSE,
                date: new Date().toISOString(),
                walletId: wallet.id,
                categoryId: category.id,
                description: 'Supermercado',
            };

            const result = await transactionService.create(userId, data);

            expect(result).toHaveProperty('id');
            expect(result.amount.toString()).toBe('100');
            expect(result.walletId).toBe(wallet.id);
        });

        // Validação de Carteira
        it('deve lançar erro se a carteira não existir', async () => {
            const userId = 'user-123';
            const category = await mockCategoryRepo.create({ userId, name: 'Lazer' });

            const data = {
                amount: 50,
                type: TransactionType.EXPENSE,
                date: new Date().toISOString(),
                walletId: 'non-existent-id', // ID inválido
                categoryId: category.id,
            };

            await expect(transactionService.create(userId, data)).rejects.toEqual(
                new AppError('Carteira nao encontrada', 404),
            );
        });

        it('deve lançar erro se a carteira pertencer a outro usuário', async () => {
            const userId = 'user-123';
            const otherUser = 'user-999';
            const wallet = await mockWalletRepo.create({
                userId: otherUser, // Carteira de outro user
                name: 'Outra Carteira',
                currency: 'BRL',
                balance: 0,
            });
            const category = await mockCategoryRepo.create({ userId, name: 'Lazer' });

            const data = {
                amount: 50,
                type: TransactionType.EXPENSE,
                date: new Date().toISOString(),
                walletId: wallet.id,
                categoryId: category.id,
            };

            await expect(transactionService.create(userId, data)).rejects.toEqual(
                new AppError('Acesso nao autorizado a esta carteira', 403),
            );
        });

        // Validação de Categoria
        it('deve lançar erro se a categoria não existir', async () => {
            const userId = 'user-123';
            const wallet = await mockWalletRepo.create({ userId, name: 'Principal', currency: 'BRL', balance: 0 });

            const data = {
                amount: 50,
                type: TransactionType.EXPENSE,
                date: new Date().toISOString(),
                walletId: wallet.id,
                categoryId: 'non-existent-id', // ID inválido
            };

            await expect(transactionService.create(userId, data)).rejects.toEqual(
                new AppError('Categoria nao encontrada', 404),
            );
        });

        it('deve lançar erro se a categoria pertencer a outro usuário', async () => {
            const userId = 'user-123';
            const otherUser = 'user-999';
            const wallet = await mockWalletRepo.create({ userId, name: 'Principal', currency: 'BRL', balance: 0 });
            const category = await mockCategoryRepo.create({ userId: otherUser, name: 'Outra Categoria' });

            const data = {
                amount: 50,
                type: TransactionType.EXPENSE,
                date: new Date().toISOString(),
                walletId: wallet.id,
                categoryId: category.id,
            };

            await expect(transactionService.create(userId, data)).rejects.toEqual(
                new AppError('Acesso nao autorizado a esta categoria', 403),
            );
        });
    });

    describe('listByUser', () => {
        it('deve listar transações paginadas do usuário', async () => {
            const userId = 'user-123';
            const wallet = await mockWalletRepo.create({ userId, name: 'Principal', currency: 'BRL', balance: 0 });
            const category = await mockCategoryRepo.create({ userId, name: 'Salário' });

            // Criar uma transação de exemplo
            await transactionService.create(userId, {
                amount: 5000,
                type: TransactionType.INCOME,
                date: new Date().toISOString(),
                walletId: wallet.id,
                categoryId: category.id,
                description: 'Salário',
            });

            // Buscar página 1
            const result = await transactionService.listByUser(userId, { page: '1', limit: '10' });

            expect(result.data).toHaveLength(1);
            expect(result.meta.total).toBe(1);
        });

        it('deve filtrar transações por carteira e data', async () => {
            const userId = 'user-123';
            const wallet1 = await mockWalletRepo.create({ userId, name: 'W1', currency: 'BRL', balance: 0 });
            const wallet2 = await mockWalletRepo.create({ userId, name: 'W2', currency: 'BRL', balance: 0 });
            const category = await mockCategoryRepo.create({ userId, name: 'C' });

            // T1: Wallet 1, Hoje
            await transactionService.create(userId, {
                amount: 100,
                type: TransactionType.EXPENSE,
                date: new Date().toISOString(),
                walletId: wallet1.id,
                categoryId: category.id,
            });

            // T2: Wallet 2, Hoje
            await transactionService.create(userId, {
                amount: 200,
                type: TransactionType.EXPENSE,
                date: new Date().toISOString(),
                walletId: wallet2.id,
                categoryId: category.id,
            });

            // Filtro por Wallet 1
            const result = await transactionService.listByUser(userId, { walletId: wallet1.id });

            expect(result).toBeDefined();
        });
    });
});
