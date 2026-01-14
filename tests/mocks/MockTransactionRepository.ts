import { ITransactionRepository } from '../../src/repositories/interfaces/ITransactionRepository';
import { Transaction, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Mock em memória do Repositório de Transações.
 * Usado para testes unitários isolados do banco de dados.
 */
export class MockTransactionRepository implements ITransactionRepository {
    private transactions: Transaction[] = [];

    /**
     * Simula a criação de uma nova transação e a adiciona à lista em memória.
     * Não simula a atualização de saldo da carteira.
     * @param data Dados da transação a ser criada.
     * @returns A transação criada.
     */
    async createWithBalanceUpdate(data: Prisma.TransactionUncheckedCreateInput): Promise<Transaction> {
        const newTransaction: Transaction = {
            id: uuidv4(),
            amount: new Prisma.Decimal(data.amount as number | string),
            type: data.type,
            date: new Date(data.date),
            description: data.description || null,
            walletId: data.walletId,
            categoryId: data.categoryId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.transactions.push(newTransaction);
        return newTransaction;
    }

    /**
     * Simula a busca de múltiplas transações.
     * Atualmente, retorna todas as transações ou aplica paginação básica.
     * @param options Opções de busca, incluindo filtros e paginação.
     * @returns Uma lista de transações.
     */
    async findMany(options: Prisma.TransactionFindManyArgs): Promise<Transaction[]> {
        // Mock simples que retorna todas as transações (expandir lógica de filtro se necessário)
        let result = this.transactions;
        if (options.where?.wallet?.userId) {
            // Filtrar mock se precisar
        }

        // Simulação básica de paginação
        if (options.take && options.skip !== undefined) {
            return result.slice(options.skip, options.skip + options.take);
        }
        return result;
    }

    /**
     * Simula a contagem de transações.
     * Atualmente, retorna o número total de transações em memória.
     * @param where Condições de filtro (não implementado no mock).
     * @returns O número total de transações.
     */
    async count(where: Prisma.TransactionWhereInput): Promise<number> {
        return this.transactions.length;
    }

    async groupByCategory(
        where: Prisma.TransactionWhereInput,
    ): Promise<{ categoryId: string; _sum: { amount: number | null } }[]> {
        return [];
    }

    async sumAmount(where: Prisma.TransactionWhereInput): Promise<number> {
        return 0;
    }
}
