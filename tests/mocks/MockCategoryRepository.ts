import { ICategoryRepository } from '../../src/repositories/interfaces/ICategoryRepository';
import { Category, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Mock em memória do Repositório de Categorias.
 * Implementa a interface ICategoryRepository para simular operações de banco de dados.
 */
export class MockCategoryRepository implements ICategoryRepository {
    private categories: Category[] = [];

    /**
     * Cria uma nova categoria no mock.
     * @param data Dados para criação da categoria.
     * @returns A categoria criada.
     */
    async create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category> {
        const newCategory: Category = {
            id: uuidv4(),
            name: data.name,
            userId: data.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.categories.push(newCategory);
        return newCategory;
    }

    /**
     * Encontra todas as categorias associadas a um ID de usuário específico.
     * @param userId O ID do usuário.
     * @returns Uma lista de categorias.
     */
    async findAllByUserId(userId: string): Promise<Category[]> {
        return this.categories.filter((c) => c.userId === userId);
    }

    /**
     * Encontra uma categoria pelo seu ID.
     * @param id O ID da categoria.
     * @returns A categoria encontrada ou null se não existir.
     */
    async findById(id: string): Promise<Category | null> {
        return this.categories.find((c) => c.id === id) || null;
    }

    /**
     * Atualiza uma categoria existente.
     * @param id O ID da categoria a ser atualizada.
     * @param data Os dados para atualização da categoria.
     * @returns A categoria atualizada.
     * @throws Error se a categoria não for encontrada.
     */
    async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
        const index = this.categories.findIndex((c) => c.id === id);
        if (index === -1) throw new Error('Categoria não encontrada');

        const updated = { ...this.categories[index], ...data, updatedAt: new Date() } as Category;
        this.categories[index] = updated;
        return updated;
    }

    /**
     * Exclui uma categoria pelo seu ID.
     * @param id O ID da categoria a ser excluída.
     */
    async delete(id: string): Promise<void> {
        this.categories = this.categories.filter((c) => c.id !== id);
    }
}
