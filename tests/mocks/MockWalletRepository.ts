import { IWalletRepository } from '../../src/repositories/interfaces/IWalletRepository';
import { Wallet, Prisma, Transaction } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export class MockWalletRepository implements IWalletRepository {
    private wallets: Wallet[] = [];

    async create(data: Prisma.WalletUncheckedCreateInput): Promise<Wallet> {
        const newWallet: Wallet = {
            id: uuidv4(),
            name: data.name || 'Nova Carteira',
            balance: new Prisma.Decimal(0),
            userId: data.userId,
            currency: data.currency || 'BRL', // Assumindo default se nao fornecido
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.wallets.push(newWallet);
        return newWallet;
    }

    async findAllByUserId(userId: string): Promise<(Wallet & { _count: { transactions: number } })[]> {
        const userWallets = this.wallets.filter((w) => w.userId === userId);
        return userWallets.map((w) => ({
            ...w,
            _count: { transactions: 0 },
        }));
    }

    async findById(id: string): Promise<Wallet | null> {
        return this.wallets.find((w) => w.id === id) || null;
    }

    async findByIdWithRecentTransactions(
        id: string,
        limit: number,
    ): Promise<(Wallet & { transactions: Transaction[] }) | null> {
        const wallet = this.wallets.find((w) => w.id === id);
        if (!wallet) return null;

        // Mockar transacoes se necessario, por enquanto array vazio
        return {
            ...wallet,
            transactions: [],
        };
    }

    async update(id: string, data: Prisma.WalletUpdateInput): Promise<Wallet> {
        const index = this.wallets.findIndex((w) => w.id === id);
        if (index === -1) {
            throw new Error('Carteira nao encontrada');
        }

        const updatedWallet = {
            ...this.wallets[index],
            ...data,
            updatedAt: new Date(),
        } as Wallet;

        this.wallets[index] = updatedWallet;
        return updatedWallet;
    }

    async delete(id: string): Promise<void> {
        this.wallets = this.wallets.filter((w) => w.id !== id);
    }
}
