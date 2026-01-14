import { User, Prisma } from "@prisma/client";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: Prisma.UserCreateInput): Promise<User>;
  findAll(
    skip: number,
    take: number,
    orderBy: Prisma.UserOrderByWithRelationInput,
  ): Promise<User[]>;
  count(): Promise<number>;
}
