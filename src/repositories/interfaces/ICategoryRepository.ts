import { Category, Prisma } from "@prisma/client";

export interface ICategoryRepository {
  create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category>;
  findAllByUserId(userId: string): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category>;
  delete(id: string): Promise<void>;
}
