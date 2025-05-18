import cache from 'memory-cache';
import logger from './logger';

export class CacheManager {
    private static instance: CacheManager;
    private cache: typeof cache;

    private constructor() {
        this.cache = cache;
    }

    public static getInstance(): CacheManager {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }

    public set(key: string, value: any, duration: number = 3600000): void {
        try {
            this.cache.put(key, value, duration);
            logger.debug(`Cache: Set key "${key}" with duration ${duration}ms`);
        } catch (error) {
            logger.error(`Cache: Error setting key "${key}": ${error}`);
        }
    }

    public get(key: string): any {
        try {
            const value = this.cache.get(key);
            logger.debug(`Cache: Get key "${key}" - ${value ? 'Hit' : 'Miss'}`);
            return value;
        } catch (error) {
            logger.error(`Cache: Error getting key "${key}": ${error}`);
            return null;
        }
    }

    public del(key: string): void {
        try {
            this.cache.del(key);
            logger.debug(`Cache: Deleted key "${key}"`);
        } catch (error) {
            logger.error(`Cache: Error deleting key "${key}": ${error}`);
        }
    }

    public clear(): void {
        try {
            this.cache.clear();
            logger.debug('Cache: Cleared all entries');
        } catch (error) {
            logger.error(`Cache: Error clearing cache: ${error}`);
        }
    }
} 