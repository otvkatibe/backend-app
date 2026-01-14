import {
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "../schemas/category.schema";
import { AppError } from "../utils/AppError";
import { ICategoryRepository } from "../repositories/interfaces/ICategoryRepository";

export class CategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  async create(userId: string, data: CreateCategoryDTO) {
    const category = await this.categoryRepository.create({
      ...data,
      userId,
    });
    return category;
  }

  async listByUser(userId: string) {
    return this.categoryRepository.findAllByUserId(userId);
  }

  async getById(userId: string, categoryId: string) {
    const category = await this.categoryRepository.findById(categoryId);

    if (!category) {
      throw new AppError("Categoria nao encontrada", 404);
    }

    if (category.userId !== userId) {
      throw new AppError("Acesso nao autorizado a esta categoria", 403);
    }

    return category;
  }

  async update(userId: string, categoryId: string, data: UpdateCategoryDTO) {
    await this.getById(userId, categoryId); // validations included

    return this.categoryRepository.update(categoryId, data);
  }

  async delete(userId: string, categoryId: string) {
    await this.getById(userId, categoryId); // validations included

    await this.categoryRepository.delete(categoryId);
  }
}

import { PrismaCategoryRepository } from "../repositories/prisma/PrismaCategoryRepository";

const categoryRepository = new PrismaCategoryRepository();
export const categoryService = new CategoryService(categoryRepository);
