/**
 * AI Cost Tracking Service
 * 
 * Tracks API usage and estimated costs per session/request.
 * Provides metrics for monitoring and budget management.
 */

import { logger } from '../shared/utils/logger';
import { AIModelType } from './ai-core';

interface UsageMetrics {
  requestCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  estimatedCost: number;
  cacheHits: number;
  cacheMisses: number;
  failedRequests: number;
}

interface RequestMetrics {
  model: AIModelType;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  timestamp: number;
  cached: boolean;
  success: boolean;
}

/**
 * Approximate token costs per 1M tokens (as of January 2026)
 * These are estimates and should be verified against actual Google pricing
 * TODO: Update pricing regularly or fetch from pricing API
 */
const MODEL_COSTS: Record<AIModelType, { input: number; output: number }> = {
  'gemini-3-flash-preview': { input: 0.075, output: 0.30 },
  'gemini-3-pro-preview': { input: 1.25, output: 5.00 },
  'gemini-2.5-flash-image': { input: 0.075, output: 0.30 },
  'gemini-3-pro-image-preview': { input: 1.25, output: 5.00 },
  'gemini-2.5-flash-lite-latest': { input: 0.038, output: 0.15 },
  'veo-3.1-fast-generate-preview': { input: 0.10, output: 0.40 },
};

export class AICostTracker {
  private static instance: AICostTracker;
  private sessionMetrics: Map<string, UsageMetrics>;
  private requestHistory: RequestMetrics[];
  private readonly maxHistorySize: number = 1000;

  private constructor() {
    this.sessionMetrics = new Map();
    this.requestHistory = [];
  }

  public static getInstance(): AICostTracker {
    if (!AICostTracker.instance) {
      AICostTracker.instance = new AICostTracker();
    }
    return AICostTracker.instance;
  }

  /**
   * Estimate token count from text (rough approximation: 1 token ≈ 4 characters)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate cost for a request based on model and token usage
   */
  public calculateCost(
    model: AIModelType,
    inputTokens: number,
    outputTokens: number
  ): number {
    const costs = MODEL_COSTS[model] || { input: 0.10, output: 0.40 };
    const inputCost = (inputTokens / 1000000) * costs.input;
    const outputCost = (outputTokens / 1000000) * costs.output;
    return inputCost + outputCost;
  }

  /**
   * Track a request and update metrics
   */
  public trackRequest(
    sessionId: string,
    model: AIModelType,
    prompt: string,
    response: string | undefined,
    cached: boolean = false,
    success: boolean = true
  ): void {
    const inputTokens = this.estimateTokens(prompt);
    const outputTokens = response ? this.estimateTokens(response) : 0;
    const cost = cached ? 0 : this.calculateCost(model, inputTokens, outputTokens);

    // Get or create session metrics
    let metrics = this.sessionMetrics.get(sessionId);
    if (!metrics) {
      metrics = {
        requestCount: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        estimatedCost: 0,
        cacheHits: 0,
        cacheMisses: 0,
        failedRequests: 0,
      };
      this.sessionMetrics.set(sessionId, metrics);
    }

    // Update metrics
    metrics.requestCount++;
    metrics.totalInputTokens += inputTokens;
    metrics.totalOutputTokens += outputTokens;
    metrics.estimatedCost += cost;
    
    if (cached) {
      metrics.cacheHits++;
    } else {
      metrics.cacheMisses++;
    }
    
    if (!success) {
      metrics.failedRequests++;
    }

    // Add to request history
    const requestMetric: RequestMetrics = {
      model,
      inputTokens,
      outputTokens,
      cost,
      timestamp: Date.now(),
      cached,
      success,
    };

    this.requestHistory.push(requestMetric);

    // Maintain history size limit
    if (this.requestHistory.length > this.maxHistorySize) {
      this.requestHistory.shift();
    }

    logger.info(`Cost Tracking: ${model} | Tokens: ${inputTokens}→${outputTokens} | Cost: $${cost.toFixed(6)} | Cached: ${cached}`);
  }

  /**
   * Get metrics for a specific session
   */
  public getSessionMetrics(sessionId: string): UsageMetrics | null {
    return this.sessionMetrics.get(sessionId) || null;
  }

  /**
   * Get aggregate metrics across all sessions
   */
  public getAggregateMetrics(): UsageMetrics {
    const aggregate: UsageMetrics = {
      requestCount: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      estimatedCost: 0,
      cacheHits: 0,
      cacheMisses: 0,
      failedRequests: 0,
    };

    for (const metrics of this.sessionMetrics.values()) {
      aggregate.requestCount += metrics.requestCount;
      aggregate.totalInputTokens += metrics.totalInputTokens;
      aggregate.totalOutputTokens += metrics.totalOutputTokens;
      aggregate.estimatedCost += metrics.estimatedCost;
      aggregate.cacheHits += metrics.cacheHits;
      aggregate.cacheMisses += metrics.cacheMisses;
      aggregate.failedRequests += metrics.failedRequests;
    }

    return aggregate;
  }

  /**
   * Get recent request history
   */
  public getRequestHistory(limit: number = 100): RequestMetrics[] {
    return this.requestHistory.slice(-limit);
  }

  /**
   * Clear all metrics
   */
  public clear(): void {
    this.sessionMetrics.clear();
    this.requestHistory = [];
    logger.info('Cost tracking data cleared');
  }

  /**
   * Clear metrics for a specific session
   */
  public clearSession(sessionId: string): void {
    this.sessionMetrics.delete(sessionId);
    logger.debug(`Session metrics cleared: ${sessionId}`);
  }

  /**
   * Export metrics as JSON for analysis
   */
  public exportMetrics(): string {
    return JSON.stringify({
      aggregate: this.getAggregateMetrics(),
      sessions: Array.from(this.sessionMetrics.entries()).map(([id, metrics]) => ({
        sessionId: id,
        ...metrics,
      })),
      recentRequests: this.getRequestHistory(50),
    }, null, 2);
  }
}

export const aiCostTracker = AICostTracker.getInstance();
