/**
 * AI Request Caching Layer
 * 
 * Implements an LRU cache for AI requests to reduce API calls and costs.
 * Uses request fingerprinting (prompt + images) as cache keys.
 */

import { logger } from '../shared/utils/logger';
import { AIResponse } from './ai-core';

interface CacheEntry {
  response: AIResponse;
  timestamp: number;
  hitCount: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

export class AICacheService {
  private static instance: AICacheService;
  private cache: Map<string, CacheEntry>;
  private readonly maxSize: number;
  private readonly ttlMs: number;
  private stats: { hits: number; misses: number };

  private constructor(maxSize: number = 100, ttlMs: number = 3600000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs; // Default 1 hour
    this.stats = { hits: 0, misses: 0 };
  }

  public static getInstance(): AICacheService {
    if (!AICacheService.instance) {
      AICacheService.instance = new AICacheService();
    }
    return AICacheService.instance;
  }

  /**
   * Generate a fingerprint for the request to use as a cache key
   */
  public generateFingerprint(
    prompt: string,
    images: string[],
    model: string,
    config?: Record<string, any>
  ): string {
    const configStr = config ? JSON.stringify(config) : '';
    const imageHashes = images.map(img => 
      // Use first and last 20 chars of base64 as a lightweight hash
      img.substring(0, 20) + img.substring(img.length - 20)
    ).join('|');
    
    const combined = `${model}:${prompt}:${imageHashes}:${configStr}`;
    
    // Simple hash function (djb2)
    let hash = 5381;
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) + hash) + combined.charCodeAt(i);
    }
    
    return `ai_${hash >>> 0}`;
  }

  /**
   * Get cached response if available and not expired
   */
  public get(fingerprint: string): AIResponse | null {
    const entry = this.cache.get(fingerprint);
    
    if (!entry) {
      this.stats.misses++;
      logger.debug(`Cache MISS: ${fingerprint}`);
      return null;
    }

    const age = Date.now() - entry.timestamp;
    if (age > this.ttlMs) {
      this.cache.delete(fingerprint);
      this.stats.misses++;
      logger.debug(`Cache EXPIRED: ${fingerprint} (age: ${Math.round(age / 1000)}s)`);
      return null;
    }

    entry.hitCount++;
    this.stats.hits++;
    logger.info(`Cache HIT: ${fingerprint} (hits: ${entry.hitCount}, age: ${Math.round(age / 1000)}s)`);
    
    return entry.response;
  }

  /**
   * Store response in cache with LRU eviction
   */
  public set(fingerprint: string, response: AIResponse): void {
    // If cache is full, evict the oldest entry (LRU)
    if (this.cache.size >= this.maxSize && !this.cache.has(fingerprint)) {
      const oldestKey = this.findOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
        logger.debug(`Cache EVICT: ${oldestKey} (LRU)`);
      }
    }

    this.cache.set(fingerprint, {
      response,
      timestamp: Date.now(),
      hitCount: 0,
    });

    logger.debug(`Cache SET: ${fingerprint} (size: ${this.cache.size}/${this.maxSize})`);
  }

  /**
   * Clear all cached entries
   */
  public clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.info(`Cache CLEARED: ${size} entries removed`);
  }

  /**
   * Clear expired entries
   */
  public clearExpired(): number {
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttlMs) {
        this.cache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      logger.info(`Cache CLEANUP: ${cleared} expired entries removed`);
    }

    return cleared;
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = { hits: 0, misses: 0 };
    logger.debug('Cache stats reset');
  }

  /**
   * Find the oldest entry in cache (for LRU eviction)
   */
  private findOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }
}

export const aiCache = AICacheService.getInstance();
