import { WalletService } from './wallet.service';
import { MockWalletRepository } from '../../tests/mocks/MockWalletRepository';
import { AppError } from '../utils/AppError';

describe('Testes Unitarios WalletService', () => {
    let walletService: WalletService;
    let mockWalletRepository: MockWalletRepository;

    beforeEach(() => {
        mockWalletRepository = new MockWalletRepository();
        walletService = new WalletService(mockWalletRepository);
    });

    describe('create', () => {
        it('deve criar uma carteira com sucesso', async () => {
            const userId = 'user-123';
            const data = { name: 'Principal', currency: 'BRL', balance: 0 };

            const result = await walletService.create(userId, data);

            expect(result).toHaveProperty('id');
            expect(result.userId).toBe(userId);
            expect(result.currency).toBe('BRL');
            expect(result.name).toBe('Principal');
        });
    });

    describe('listByUser', () => {
        it('deve listar carteiras de um usuario', async () => {
            const userId = 'user-123';
            await walletService.create(userId, { name: 'Carteira 1', currency: 'BRL', balance: 0 });
            await walletService.create(userId, { name: 'Carteira 2', currency: 'USD', balance: 0 });

            const result = await walletService.listByUser(userId);

            expect(result).toHaveLength(2);
            expect(result[0].userId).toBe(userId);
        });
    });

    describe('getById', () => {
        it('deve retornar uma carteira se pertencer ao usuario', async () => {
            const userId = 'user-123';
            const created = await walletService.create(userId, { name: 'Euro Wallet', currency: 'EUR', balance: 0 });

            const result = await walletService.getById(userId, created.id);

            expect(result.id).toBe(created.id);
            expect(result.userId).toBe(userId);
        });

        it('deve lancar erro se carteira nao existir', async () => {
            await expect(walletService.getById('user-123', 'non-existent-id')).rejects.toEqual(
                new AppError('Carteira nao encontrada', 404),
            );
        });

        it('deve lancar erro se carteira nao pertencer ao usuario', async () => {
            const ownerId = 'user-1';
            const otherUser = 'user-2';
            const created = await walletService.create(ownerId, {
                name: 'Minha Carteira',
                currency: 'BRL',
                balance: 0,
            });

            await expect(walletService.getById(otherUser, created.id)).rejects.toEqual(
                new AppError('Acesso nao autorizado a esta carteira', 403),
            );
        });
    });

    describe('update', () => {
        it('deve atualizar uma carteira com sucesso', async () => {
            const userId = 'user-123';
            const created = await walletService.create(userId, { name: 'Old Name', currency: 'BRL', balance: 0 });

            const result = await walletService.update(userId, created.id, { name: 'New Name' });

            expect(result.name).toBe('New Name');
        });

        it('deve lancar erro ao tentar atualizar carteira de outro usuario', async () => {
            const userId = 'user-1';
            const otherUser = 'user-2';
            const created = await walletService.create(userId, { name: 'Test', currency: 'BRL', balance: 0 });

            await expect(walletService.update(otherUser, created.id, { name: 'Updated' })).rejects.toEqual(
                new AppError('Acesso nao autorizado a esta carteira', 403),
            );
        });
    });

    describe('delete', () => {
        it('deve deletar uma carteira com sucesso', async () => {
            const userId = 'user-123';
            const created = await walletService.create(userId, { name: 'To Delete', currency: 'BRL', balance: 0 });

            await walletService.delete(userId, created.id);

            await expect(walletService.getById(userId, created.id)).rejects.toEqual(
                new AppError('Carteira nao encontrada', 404),
            );
        });

        it('deve lancar erro ao tentar deletar carteira de outro usuario', async () => {
            const userId = 'user-1';
            const otherUser = 'user-2';
            const created = await walletService.create(userId, { name: 'Cannot Delete', currency: 'BRL', balance: 0 });

            await expect(walletService.delete(otherUser, created.id)).rejects.toEqual(
                new AppError('Acesso nao autorizado a esta carteira', 403),
            );
        });
    });
});
