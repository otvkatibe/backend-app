import { Wallet, Prisma, Transaction } from "@prisma/client";

export interface IWalletRepository {
  create(data: Prisma.WalletUncheckedCreateInput): Promise<Wallet>;
  findAllByUserId(
    userId: string,
  ): Promise<(Wallet & { _count: { transactions: number } })[]>;
  findById(id: string): Promise<Wallet | null>;
  findByIdWithRecentTransactions(
    id: string,
    limit: number,
  ): Promise<(Wallet & { transactions: Transaction[] }) | null>;
  update(id: string, data: Prisma.WalletUpdateInput): Promise<Wallet>;
  delete(id: string): Promise<void>;
}
