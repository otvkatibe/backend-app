import { Prisma, User } from '@prisma/client';
import { IUserRepository } from '../../src/repositories/interfaces/IUserRepository';
import { v4 as uuidv4 } from 'uuid';

export class MockUserRepository implements IUserRepository {
    public users: User[] = [];

    async findByEmail(email: string): Promise<User | null> {
        return this.users.find((u) => u.email === email) || null;
    }

    async findById(id: string): Promise<User | null> {
        return this.users.find((u) => u.id === id) || null;
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        const newUser: User = {
            id: uuidv4(),
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role || 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
            baseCurrency: 'BRL', // Padrão por enquanto
        };
        this.users.push(newUser);
        return newUser;
    }

    async findAll(skip: number, take: number, orderBy: Prisma.UserOrderByWithRelationInput): Promise<User[]> {
        let result = [...this.users];

        // Implementação básica de ordenação (suporta apenas nome asc/desc por enquanto, conforme caso de uso)
        if (orderBy && orderBy.name) {
            result.sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                if (orderBy.name === 'asc') return nameA < nameB ? -1 : 1;
                return nameA > nameB ? -1 : 1;
            });
        }

        return result.slice(skip, skip + take);
    }

    async count(): Promise<number> {
        return this.users.length;
    }
}
