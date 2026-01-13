import Redis from 'ioredis';
import { logger } from '../utils/logger';

class CacheService {
    private static instance: CacheService;
    private redis: Redis;

    private constructor() {
        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            maxRetriesPerRequest: 1, // Fail fast for commands
            enableOfflineQueue: false, // Do not queue commands if disconnected
            lazyConnect: true,
            retryStrategy: (times) => {
                // Exponential backoff with max delay of 2 seconds
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        });

        this.redis.on('connect', () => {
            logger.info('Redis connected successfully');
        });

        this.redis.on('error', (err) => {
            logger.error('Redis connection error:', err);
        });
    }

    public static getInstance(): CacheService {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }

    /**
     * Get value from cache
     * @param key Cache key
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            if (this.redis.status !== 'ready') return null;
            const data = await this.redis.get(key);
            if (!data) return null;
            return JSON.parse(data) as T;
        } catch (error) {
            logger.error(`Cache GET error for key ${key}:`, error);
            return null;
        }
    }

    /**
     * Set value in cache
     * @param key Cache key
     * @param value Data to store
     * @param ttl Time to live in seconds (default 60)
     */
    async set(key: string, value: any, ttl: number = 60): Promise<void> {
        try {
            if (this.redis.status !== 'ready') return;
            await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
        } catch (error) {
            logger.error(`Cache SET error for key ${key}:`, error);
        }
    }

    /**
     * Delete value from cache
     * @param key Cache key
     */
    async del(key: string): Promise<void> {
        try {
            if (this.redis.status !== 'ready') return;
            await this.redis.del(key);
        } catch (error) {
            logger.error(`Cache DEL error for key ${key}:`, error);
        }
    }

    /**
     * Connect to Redis (creates instance if not exists)
     */
    public async connect(): Promise<void> {
        try {
            await this.redis.connect();
        } catch (error) {
            logger.error('Failed to connect to Redis', error);
        }
    }

    /**
     * Disconnect from Redis
     */
    public async disconnect(): Promise<void> {
        await this.redis.quit();
    }

    /**
     * Get the underlying Redis client instance
     */
    public getRedisClient(): Redis {
        return this.redis;
    }
}

export const cacheService = CacheService.getInstance();
