import { RefreshToken, User } from '@prisma/client';
import { ITokenRepository } from '../../src/repositories/interfaces/ITokenRepository';
import { v4 as uuidv4 } from 'uuid';

export class MockTokenRepository implements ITokenRepository {
    public tokens: (RefreshToken & { user: User })[] = [];

    async create(data: { token: string; userId: string; expiresAt: Date }): Promise<RefreshToken> {
        const refreshToken: RefreshToken = {
            id: uuidv4(),
            token: data.token,
            userId: data.userId,
            expiresAt: data.expiresAt,
            revoked: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Dificil vincular o objeto de usuário completo aqui sem acesso a um repo de usuários,
        // mas para criação geralmente retorna apenas o token ou mockamos o que precisamos.
        // Para findByTokenWithUser precisamos garantir que o token adicionado tem o usuário anexado em nosso armazenamento mock.

        // Esta implementação mock armazenará com usuário nulo por enquanto,
        // mas testes devem popular manualmente 'tokens' com objetos de usuário se necessário para chamadas find.

        // No entanto, para fazer isso funcionar para criação, verificamos se podemos popular mais tarde ou apenas retornar.
        // A interface retorna Promise<RefreshToken> para create, então isso está ok.

        // Armazenar estruturalmente compatível com o que findByTokenWithUser espera?
        // findByTokenWithUser espera RefresToken & { user: User }
        // Armazenaremos como any e faremos cast ao recuperar ou testes empurrarão objetos completos manualmente.

        // Melhor estratégia: A implementação do método create no serviço geralmente precisa apenas do token criado.
        // O findByToken precisa do usuário.

        // Armazenaremos um parcial e faremos cast por enquanto, testes precisarão lidar com consistência de relacionamento se inspecionarem estado interno.

        // Na verdade, vamos permitir encontrar usuário se passarmos uma fonte "users" ou apenas mockar comportamento.
        // Por simplicidade, assumimos que testes garantindo que findByTokenWithUser funcione popularão manualmente o store mock com objetos formados
        // Ou apenas armazenamos o que temos.

        this.tokens.push(refreshToken as any);
        return refreshToken;
    }

    async findByTokenWithUser(token: string): Promise<(RefreshToken & { user: User }) | null> {
        return this.tokens.find((t) => t.token === token) || null;
    }

    async revoke(id: string): Promise<RefreshToken> {
        const token = this.tokens.find((t) => t.id === id);
        if (!token) throw new Error('Token not found');
        token.revoked = true;
        return token;
    }

    async deleteExpired(): Promise<number> {
        const now = new Date();
        const initialCount = this.tokens.length;
        this.tokens = this.tokens.filter((t) => t.expiresAt > now && !t.revoked);
        return initialCount - this.tokens.length;
    }
}
