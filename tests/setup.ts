// Mock do Redis globalmente antes de qualquer importação
jest.mock("ioredis", () => {
  const storage = new Map<string, string>();
  return class Redis {
    status = "ready";
    constructor() { }
    connect() {
      return Promise.resolve();
    }
    on(event: string, callback: any) {
      if (event === "connect") callback();
      return this;
    }
    async get(key: string) {
      return storage.get(key) || null;
    }
    async set(key: string, value: string) {
      storage.set(key, value);
      return "OK";
    }
    async del(key: string) {
      storage.delete(key);
      return 1;
    }
    quit() {
      return Promise.resolve("OK");
    }
    duplicate() {
      return this;
    }
    // Stub para chamada do rate-limit-redis
    async call(command: string, ...args: any[]) {
      // Se o comando for script load, retorna um SHA falso
      if (command.toLowerCase() === "script")
        return "e0e1f9fabfc9d4800c877a703b823ac0578ff8db";
      return 1;
    }
  };
});

// Mock do express-rate-limit para ignorar limitação de taxa nos testes
jest.mock("express-rate-limit", () => {
  return jest.fn(() => (req: any, res: any, next: any) => next());
});

// Mock do rate-limit-redis (opcional agora, mas mantido para evitar erros de importação se invocado em outro lugar)
jest.mock("rate-limit-redis", () => {
  return class RedisStore {
    constructor() { }
    init() { }
    increment(key: string) {
      return Promise.resolve({ totalHits: 1, resetTime: new Date() });
    }
    decrement(key: string) { }
    resetKey(key: string) { }
  };
});

import { prisma } from "../src/utils/prisma";

export const clearDatabase = async () => {
  // Trunca todas as tabelas para garantir um estado limpo
  // Usa CASCADE para lidar com chaves estrangeiras
  await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE "transactions", "budgets", "goals", "categories", "wallets", "users" RESTART IDENTITY CASCADE;
    `);
};
