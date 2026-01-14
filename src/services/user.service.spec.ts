import { UserService } from './user.service';
import { MockUserRepository } from '../../tests/mocks/MockUserRepository';
import { MockTokenRepository } from '../../tests/mocks/MockTokenRepository';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Mock do módulo cache service já que ele não é injetado
jest.mock('./cache.service', () => ({
    cacheService: {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue(undefined),
        del: jest.fn().mockResolvedValue(undefined),
    },
}));

describe('UserService Unit Tests', () => {
    let userService: UserService;
    let userRepository: MockUserRepository;
    let tokenRepository: MockTokenRepository;

    beforeEach(() => {
        userRepository = new MockUserRepository();
        tokenRepository = new MockTokenRepository();

        userService = new UserService(userRepository, tokenRepository);

        // Reseta variáveis de ambiente para JWT
        process.env.JWT_SECRET = 'test-secret';
        process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    });

    describe('create', () => {
        it('should create a new user successfully', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            };

            const user = await userService.create(userData);

            expect(user).toBeDefined();
            expect(user.id).toBeDefined();
            expect(user.email).toBe(userData.email);
            // Verifica se a senha NÃO é retornada
            expect(user).not.toHaveProperty('password');
        });

        it('should throw error if email already exists', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            };

            // Registrar primeira vez
            await userService.create(userData);

            // Registrar segunda vez
            await expect(userService.create(userData)).rejects.toThrow('Usuario ja existe');
        });
    });

    describe('authenticate', () => {
        it('should authenticate user and return tokens', async () => {
            const password = 'password123';
            const user = await userRepository.create({
                name: 'Auth User',
                email: 'auth@example.com',
                password: await bcrypt.hash(password, 10),
            });

            const result = await userService.authenticate({ email: 'auth@example.com', password });

            expect(result).toBeDefined();
            expect(result.user.id).toBe(user.id);
            expect(result.accessToken).toBeDefined();
            expect(result.refreshToken).toBeDefined();

            // Verifica payload do token
            const decoded = jwt.verify(result.accessToken, process.env.JWT_SECRET!) as JwtPayload;
            expect(decoded.id).toBe(user.id);
        });

        it('should throw error for invalid email', async () => {
            await expect(userService.authenticate({ email: 'wrong@example.com', password: 'pass' })).rejects.toThrow(
                'Email ou senha invalidos',
            );
        });

        it('should throw error for invalid password', async () => {
            const password = 'correct-password';
            await userRepository.create({
                name: 'Auth User',
                email: 'auth2@example.com',
                password: await bcrypt.hash(password, 10),
            });

            await expect(
                userService.authenticate({ email: 'auth2@example.com', password: 'wrong-pass' }),
            ).rejects.toThrow('Email ou senha invalidos');
        });
    });

    describe('refreshToken', () => {
        it('should refresh token successfully', async () => {
            // 1. Criar Usuário
            const user = await userRepository.create({
                name: 'Refresh User',
                email: 'refresh@example.com',
                password: 'pass',
            });

            // 2. Mock verify para sucesso
            jest.spyOn(jwt, 'verify').mockImplementation(() => ({ id: user.id }) as JwtPayload);

            // 3. Obter refresh token original
            const oldTokenString = 'valid-refresh-token';

            // 4. Inserir token no repositório
            const tokenEntry = await tokenRepository.create({
                token: oldTokenString,
                userId: user.id,
                expiresAt: new Date(Date.now() + 100000),
            });
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            tokenEntry.user = user; // Manualmente vincular usuário

            // 5. Chamar lógica de refresh
            const result = await userService.refreshToken(oldTokenString);

            expect(result).toBeDefined();
            expect(result.accessToken).toBeDefined();
            expect(result.refreshToken).toBeDefined();
            expect(result.refreshToken).not.toBe(oldTokenString);

            // Verifica se o token antigo foi revogado
            const revokedToken = tokenRepository.tokens.find((t) => t.token === oldTokenString);
            expect(revokedToken?.revoked).toBe(true);
        });

        it('should throw error if refresh token is not found', async () => {
            jest.spyOn(jwt, 'verify').mockImplementation(() => ({}) as JwtPayload);
            await expect(userService.refreshToken('non-existent-token')).rejects.toThrow('Refresh token invalido');
        });

        it('should throw error if refresh token is revoked', async () => {
            const user = await userRepository.create({ name: 'U', email: 'e', password: 'p' });
            const tokenString = 'revoked-token';
            const tokenEntry = await tokenRepository.create({
                token: tokenString,
                userId: user.id,
                expiresAt: new Date(Date.now() + 100000),
            });
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            tokenEntry.user = user;
            await tokenRepository.revoke(tokenEntry.id);

            jest.spyOn(jwt, 'verify').mockImplementation(() => ({}) as JwtPayload);

            await expect(userService.refreshToken(tokenString)).rejects.toThrow('Refresh token revogado');
        });
    });
});
