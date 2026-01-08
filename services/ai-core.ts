import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { AppError, ApiError, AuthenticationError, SafetyError, RateLimitError } from '../shared/utils/errors';
import { cleanBase64, getMimeType } from '../shared/utils/image';
import { logger } from '../shared/utils/logger';
import { DEFAULT_RETRY_COUNT, RETRY_BASE_DELAY_MS, RETRY_MAX_JITTER_MS, DEFAULT_THINKING_BUDGET, DEFAULT_MAX_OUTPUT_TOKENS } from '../shared/constants';
import { aiCache } from './ai-cache';
import { aiCostTracker } from './ai-cost-tracker';

export type AIModelType = 
  | 'gemini-3-flash-preview' 
  | 'gemini-3-pro-preview' 
  | 'gemini-2.5-flash-image' 
  | 'gemini-3-pro-image-preview'
  | 'gemini-2.5-flash-lite-latest'
  | 'veo-3.1-fast-generate-preview';

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
export type ImageSize = "1K" | "2K" | "4K";

export interface AIRequestConfig {
  model: AIModelType;
  aspectRatio?: AspectRatio;
  imageSize?: ImageSize;
  thinkingBudget?: number;
  maxOutputTokens?: number;
  useSearch?: boolean;
  systemInstruction?: string;
  responseMimeType?: string;
  maxRetries?: number;
  seed?: number;
  temperature?: number;
  enableCache?: boolean;  // Enable request caching
  sessionId?: string;      // Session ID for cost tracking
  signal?: AbortSignal;    // Support for request cancellation
}

export interface AIResponse {
  text?: string;
  image?: string;
  groundingSources?: any[];
  finishReason?: string;
}

class AICoreService {
  private static instance: AICoreService;

  private constructor() {}

  public static getInstance(): AICoreService {
    if (!AICoreService.instance) AICoreService.instance = new AICoreService();
    return AICoreService.instance;
  }

  /**
   * Always retrieves the current API key from the environment.
   */
  private getApiKey(): string {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new AuthenticationError("API_KEY_MISSING: Environment key unavailable.");
    return apiKey;
  }

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private normalizeError(error: any): AppError {
    if (error instanceof AppError) return error;
    
    const message = error?.message || String(error);
    const status = error?.status || error?.response?.status;
    const lowerMsg = message.toLowerCase();

    if (status === 429) return new RateLimitError();
    if (status === 401 || status === 403) {
      if (lowerMsg.includes("not found") || lowerMsg.includes("billing")) {
        return new AuthenticationError(`ACCOUNT_ERROR: ${message}`);
      }
      return new AuthenticationError();
    }

    if (lowerMsg.includes("safety") || lowerMsg.includes("blocked") || lowerMsg.includes("candidate")) {
      return new SafetyError(`SAFETY_BLOCK: ${message}`);
    }

    if (lowerMsg.includes("overloaded") || lowerMsg.includes("503") || lowerMsg.includes("capacity")) {
      return new ApiError(`SYSTEM_OVERLOAD: ${message}`, 503);
    }

    return new ApiError(message, status || 500);
  }

  /**
   * Orchestrates content generation with retry logic, caching, and cost tracking.
   */
  public async generate(
    prompt: string,
    images: string[] = [],
    config: AIRequestConfig
  ): Promise<AIResponse> {
    const sessionId = config.sessionId || 'default';
    const enableCache = config.enableCache !== false; // Default to true
    
    // Check cache first
    if (enableCache) {
      const cacheConfig = {
        aspectRatio: config.aspectRatio,
        imageSize: config.imageSize,
        temperature: config.temperature,
      };
      const fingerprint = aiCache.generateFingerprint(prompt, images, config.model, cacheConfig);
      const cached = aiCache.get(fingerprint);
      
      if (cached) {
        // Track cached request
        aiCostTracker.trackRequest(sessionId, config.model, prompt, cached.text, true, true);
        return cached;
      }
    }
    
    const retries = config.maxRetries ?? DEFAULT_RETRY_COUNT;
    let lastError: any;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Check if request was aborted
        if (config.signal?.aborted) {
          throw new ApiError('Request aborted by user', 499);
        }
        
        // ALWAYS create a fresh instance per request to ensure latest key is used.
        const apiKey = this.getApiKey();
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await this.executeRequest(ai, prompt, images, config);
        
        // Cache successful response
        if (enableCache && response) {
          const cacheConfig = {
            aspectRatio: config.aspectRatio,
            imageSize: config.imageSize,
            temperature: config.temperature,
          };
          const fingerprint = aiCache.generateFingerprint(prompt, images, config.model, cacheConfig);
          aiCache.set(fingerprint, response);
        }
        
        // Track successful request
        aiCostTracker.trackRequest(sessionId, config.model, prompt, response.text, false, true);
        
        return response;
      } catch (error) {
        lastError = error;
        const normalized = this.normalizeError(error);
        
        // Finalize immediately on non-transient or security errors
        if (
          normalized instanceof SafetyError || 
          normalized instanceof AuthenticationError || 
          (normalized instanceof ApiError && normalized.statusCode === 400)
        ) {
          // Track failed request
          aiCostTracker.trackRequest(sessionId, config.model, prompt, undefined, false, false);
          throw normalized;
        }

        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * RETRY_BASE_DELAY_MS + (Math.random() * RETRY_MAX_JITTER_MS);
          logger.warn(`AICore Retry ${attempt + 1}/${retries}: ${normalized.message}`);
          await this.sleep(delay);
          continue;
        }
      }
    }
    
    // Track final failure
    aiCostTracker.trackRequest(sessionId, config.model, prompt, undefined, false, false);
    throw this.normalizeError(lastError);
  }

  private async executeRequest(
    ai: GoogleGenAI,
    prompt: string,
    images: string[] = [],
    config: AIRequestConfig
  ): Promise<AIResponse> {
    const parts: Part[] = images.filter(Boolean).map(img => ({
      inlineData: { data: cleanBase64(img), mimeType: getMimeType(img) }
    }));
    parts.push({ text: prompt || "Analyze input assets." });

    const generationConfig: any = {
      systemInstruction: config.systemInstruction,
      responseMimeType: config.responseMimeType,
      temperature: config.temperature ?? 0.7,
      seed: config.seed,
    };

    // Budget Coordination: Reserve tokens for output when thinking is enabled
    if (config.thinkingBudget !== undefined) {
      const budget = config.thinkingBudget;
      generationConfig.thinkingConfig = { thinkingBudget: budget };
      if (config.maxOutputTokens) {
        generationConfig.maxOutputTokens = Math.max(config.maxOutputTokens, budget + 1024);
      } else {
        generationConfig.maxOutputTokens = budget + DEFAULT_MAX_OUTPUT_TOKENS;
      }
    } else if (config.maxOutputTokens) {
      generationConfig.maxOutputTokens = config.maxOutputTokens;
    }

    if (config.useSearch) generationConfig.tools = [{ googleSearch: {} }];

    if (config.model.includes('image')) {
      generationConfig.imageConfig = { aspectRatio: config.aspectRatio || "1:1" };
      if (config.model === 'gemini-3-pro-image-preview') {
        generationConfig.imageConfig.imageSize = config.imageSize || "1K";
      }
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: config.model,
      contents: { parts },
      config: generationConfig,
    });

    return this.parseResponse(response);
  }

  private parseResponse(response: GenerateContentResponse): AIResponse {
    const candidate = response.candidates?.[0];
    if (!candidate) throw new ApiError("ZERO_CANDIDATES: Pipeline produced no results.", 500);

    const result: AIResponse = {
      text: response.text,
      finishReason: candidate.finishReason,
      groundingSources: candidate.groundingMetadata?.groundingChunks
    };

    const imagePart = candidate.content?.parts.find(p => p.inlineData);
    if (imagePart?.inlineData?.data) {
      result.image = `data:image/png;base64,${imagePart.inlineData.data}`;
    }

    return result;
  }
}

export const aiCore = AICoreService.getInstance();