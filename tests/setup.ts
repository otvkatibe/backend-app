// Mock Redis globally before any imports
jest.mock("ioredis", () => {
  const storage = new Map<string, string>();
  return class Redis {
    status = "ready";
    constructor() {}
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
    // Stub for rate-limit-redis call
    async call(command: string, ...args: any[]) {
      // If command is script load, return a fake SHA
      if (command.toLowerCase() === "script")
        return "e0e1f9fabfc9d4800c877a703b823ac0578ff8db";
      return 1;
    }
  };
});

// Mock express-rate-limit to bypass rate limiting in tests
jest.mock("express-rate-limit", () => {
  return jest.fn(() => (req: any, res: any, next: any) => next());
});

// Mock rate-limit-redis (optional now, but kept to avoid import errors if invoked elsewhere)
jest.mock("rate-limit-redis", () => {
  return class RedisStore {
    constructor() {}
    init() {}
    increment(key: string) {
      return Promise.resolve({ totalHits: 1, resetTime: new Date() });
    }
    decrement(key: string) {}
    resetKey(key: string) {}
  };
});

import { prisma } from "../src/utils/prisma";

export const clearDatabase = async () => {
  // Truncate all tables to ensure clean state
  // Use CASCADE to handle foreign keys
  await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE "transactions", "budgets", "goals", "categories", "wallets", "users" RESTART IDENTITY CASCADE;
    `);
};
