import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { cacheService } from '../services/cache.service';

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store: new RedisStore({
        // @ts-expect-error - Redis client type mismatch between ioredis and rate-limit-redis
        sendCommand: (...args: string[]) => cacheService.getRedisClient().call(args[0], ...args.slice(1)),
        prefix: 'rl:global:',
    }),
    message: {
        status: 'error',
        message: 'Muitas requisicoes deste IP, por favor tente novamente mais tarde.',
    },
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 create account/login requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        // @ts-expect-error - Redis client type mismatch between ioredis and rate-limit-redis
        sendCommand: (...args: string[]) => cacheService.getRedisClient().call(args[0], ...args.slice(1)),
        prefix: 'rl:auth:',
    }),
    message: {
        status: 'error',
        message: 'Muitas tentativas de login deste IP, por favor tente novamente apos 15 minutos',
    },
});
