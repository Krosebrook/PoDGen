/**
 * Tests for AI Cache Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AICacheService } from '../services/ai-cache';
import { AIResponse } from '../services/ai-core';

describe('AICacheService', () => {
  let cache: AICacheService;

  beforeEach(() => {
    cache = AICacheService.getInstance();
    cache.clear();
    cache.resetStats();
  });

  describe('generateFingerprint', () => {
    it('should generate consistent fingerprints for same inputs', () => {
      const prompt = 'Create a sunset scene';
      const images = ['data:image/png;base64,abc123'];
      const model = 'gemini-3-flash-preview';
      
      const fp1 = cache.generateFingerprint(prompt, images, model);
      const fp2 = cache.generateFingerprint(prompt, images, model);
      
      expect(fp1).toBe(fp2);
      expect(fp1).toMatch(/^ai_\d+$/);
    });

    it('should generate different fingerprints for different prompts', () => {
      const images = ['data:image/png;base64,abc123'];
      const model = 'gemini-3-flash-preview';
      
      const fp1 = cache.generateFingerprint('Prompt A', images, model);
      const fp2 = cache.generateFingerprint('Prompt B', images, model);
      
      expect(fp1).not.toBe(fp2);
    });

    it('should generate different fingerprints for different images', () => {
      const prompt = 'Create art';
      const model = 'gemini-3-flash-preview';
      
      const fp1 = cache.generateFingerprint(prompt, ['image1'], model);
      const fp2 = cache.generateFingerprint(prompt, ['image2'], model);
      
      expect(fp1).not.toBe(fp2);
    });
  });

  describe('get and set', () => {
    it('should store and retrieve responses', () => {
      const response: AIResponse = {
        text: 'Generated content',
        finishReason: 'STOP',
      };
      
      const fingerprint = 'ai_test_123';
      cache.set(fingerprint, response);
      
      const retrieved = cache.get(fingerprint);
      expect(retrieved).toEqual(response);
    });

    it('should return null for non-existent keys', () => {
      const result = cache.get('ai_nonexistent');
      expect(result).toBeNull();
    });

    it('should track cache hits and misses', () => {
      const response: AIResponse = { text: 'Test' };
      const fingerprint = 'ai_test_456';
      
      // Miss
      cache.get(fingerprint);
      
      // Set
      cache.set(fingerprint, response);
      
      // Hit
      cache.get(fingerprint);
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });
  });

  describe('LRU eviction', () => {
    it('should evict oldest entries when cache is full', () => {
      const smallCache = new (AICacheService as any)(3, 3600000); // Max 3 entries
      
      const response: AIResponse = { text: 'Test' };
      
      smallCache.set('ai_1', response);
      smallCache.set('ai_2', response);
      smallCache.set('ai_3', response);
      
      // This should evict ai_1
      smallCache.set('ai_4', response);
      
      expect(smallCache.get('ai_1')).toBeNull();
      expect(smallCache.get('ai_2')).not.toBeNull();
      expect(smallCache.get('ai_3')).not.toBeNull();
      expect(smallCache.get('ai_4')).not.toBeNull();
    });
  });

  describe('TTL expiration', () => {
    it('should expire entries after TTL', () => {
      const shortTtlCache = new (AICacheService as any)(100, 100); // 100ms TTL
      const response: AIResponse = { text: 'Test' };
      const fingerprint = 'ai_expire_test';
      
      shortTtlCache.set(fingerprint, response);
      
      // Should be available immediately
      expect(shortTtlCache.get(fingerprint)).not.toBeNull();
      
      // Wait for TTL to expire
      return new Promise(resolve => {
        setTimeout(() => {
          expect(shortTtlCache.get(fingerprint)).toBeNull();
          resolve(true);
        }, 150);
      });
    });
  });

  describe('clearExpired', () => {
    it('should remove expired entries', () => {
      const shortTtlCache = new (AICacheService as any)(100, 100); // 100ms TTL
      const response: AIResponse = { text: 'Test' };
      
      shortTtlCache.set('ai_1', response);
      shortTtlCache.set('ai_2', response);
      
      return new Promise(resolve => {
        setTimeout(() => {
          const cleared = shortTtlCache.clearExpired();
          expect(cleared).toBe(2);
          expect(shortTtlCache.getStats().size).toBe(0);
          resolve(true);
        }, 150);
      });
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      const response: AIResponse = { text: 'Test' };
      
      cache.set('ai_1', response);
      cache.set('ai_2', response);
      cache.set('ai_3', response);
      
      cache.clear();
      
      const stats = cache.getStats();
      expect(stats.size).toBe(0);
    });
  });
});
