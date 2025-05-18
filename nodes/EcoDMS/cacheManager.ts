import { INodePropertyOptions } from 'n8n-workflow';
import logger from './logger';

interface CacheEntry {
	data: INodePropertyOptions[];
	timestamp: number;
}

interface Cache {
	[key: string]: CacheEntry;
}

export class CacheManager {
    private static instance: CacheManager;
    private cache: Cache = {};
    private readonly ttl: number;

    private constructor(ttlInMinutes = 5) {
        this.ttl = ttlInMinutes * 60 * 1000; // Konvertiere Minuten in Millisekunden
    }

    public static getInstance(): CacheManager {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }

    public get(key: string): INodePropertyOptions[] | null {
        const entry = this.cache[key];
        if (!entry) return null;

        // Prüfe, ob der Cache-Eintrag abgelaufen ist
        if (Date.now() - entry.timestamp > this.ttl) {
            delete this.cache[key];
            return null;
        }

        return entry.data;
    }

    public set(key: string, data: INodePropertyOptions[]): void {
        this.cache[key] = {
            data,
            timestamp: Date.now(),
        };
    }

    public del(key: string): void {
        try {
            delete this.cache[key];
            logger.debug(`Cache: Deleted key "${key}"`);
        } catch (error) {
            logger.error(`Cache: Error deleting key "${key}": ${error}`);
        }
    }

    public clear(): void {
        this.cache = {};
    }
} 