import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { AppError, RateLimitError, SafetyError, ApiError, AuthenticationError, ValidationError } from '../shared/utils/errors';
import { cleanBase64, getMimeType } from '../shared/utils/image';
import { logger } from '../shared/utils/logger';

export type AIModelType = 
  | 'gemini-3-flash-preview' 
  | 'gemini-3-pro-preview' 
  | 'gemini-2.5-flash-image' 
  | 'gemini-3-pro-image-preview'
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
  temperature?: number;
  maxRetries?: number;
}

export interface AIResponse {
  text?: string;
  image?: string;
  groundingSources?: any[];
  finishReason?: string;
}

/**
 * GeminiService: Central AI orchestration layer.
 * Adheres to @google/genai coding guidelines.
 */
class GeminiService {
  private static instance: GeminiService;
  private readonly DEFAULT_RETRIES = 2;

  private constructor() {}

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) GeminiService.instance = new GeminiService();
    return GeminiService.instance;
  }

  /**
   * Always creates a fresh client to ensure we pick up the latest API key
   * injected into the environment.
   */
  private createClient(): GoogleGenAI {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new AuthenticationError("API Configuration missing: process.env.API_KEY is required.");
    }
    return new GoogleGenAI({ apiKey });
  }

  private mapError(error: any): AppError {
    if (error instanceof AppError) return error;
    
    const message = error?.message || String(error);
    const status = error?.status || error?.response?.status;
    const lowerMsg = message.toLowerCase();

    if (status === 429 || lowerMsg.includes("rate limit")) return new RateLimitError();
    if (status === 401 || status === 403) return new AuthenticationError("Authentication failed. Please verify your API key.");
    if (lowerMsg.includes("safety") || lowerMsg.includes("blocked")) return new SafetyError("The request was blocked by AI safety filters.");
    if (status === 503 || lowerMsg.includes("overloaded") || lowerMsg.includes("capacity")) {
      return new ApiError("AI cluster is currently at capacity. Retrying...", 503);
    }
    
    return new ApiError(message, status || 500);
  }

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Main request method with exponential backoff and jitter.
   */
  public async request(
    prompt: string,
    images: string[] = [],
    config: AIRequestConfig
  ): Promise<AIResponse> {
    const maxRetries = config.maxRetries ?? this.DEFAULT_RETRIES;

    return this.withRetry(async () => {
      const ai = this.createClient();
      const parts: Part[] = images.filter(Boolean).map(img => ({
        inlineData: { 
          data: cleanBase64(img), 
          mimeType: getMimeType(img) 
        }
      }));
      parts.push({ text: prompt });

      const modelConfig: any = {
        systemInstruction: config.systemInstruction,
        temperature: config.temperature ?? 0.7,
      };

      // Rules: If maxOutputTokens is set, thinkingBudget must also be set.
      // If thinkingBudget is set, maxOutputTokens should accommodate it.
      if (config.thinkingBudget !== undefined) {
        modelConfig.thinkingConfig = { thinkingBudget: config.thinkingBudget };
        if (config.maxOutputTokens) {
          modelConfig.maxOutputTokens = config.maxOutputTokens;
        } else {
          // Default buffer for output after thinking
          modelConfig.maxOutputTokens = config.thinkingBudget + 2048;
        }
      } else if (config.maxOutputTokens) {
        modelConfig.maxOutputTokens = config.maxOutputTokens;
      }

      if (config.useSearch) {
        modelConfig.tools = [{ googleSearch: {} }];
      }

      // Model-specific configurations
      if (config.model.includes('image')) {
        modelConfig.imageConfig = { 
          aspectRatio: config.aspectRatio || "1:1" 
        };
        if (config.model === 'gemini-3-pro-image-preview') {
          modelConfig.imageConfig.imageSize = config.imageSize || "1K";
        }
      }

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: config.model,
        contents: { parts },
        config: modelConfig,
      });

      const candidate = response.candidates?.[0];
      const result: AIResponse = {
        text: response.text,
        finishReason: candidate?.finishReason,
        groundingSources: candidate?.groundingMetadata?.groundingChunks
      };

      // Find the image part in the response
      const imagePart = candidate?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData?.data) {
        result.image = `data:image/png;base64,${imagePart.inlineData.data}`;
      }

      return result;
    }, maxRetries);
  }

  private async withRetry<T>(fn: () => Promise<T>, retries: number): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const mapped = this.mapError(error);
      const isTransient = mapped.statusCode === 503 || mapped instanceof RateLimitError;

      if (retries > 0 && isTransient) {
        // Exponential backoff: 2^attempt * 1000ms + random jitter
        const delay = Math.pow(2, 2 - retries) * 1000 + Math.random() * 500;
        logger.warn(`Gemini Service: Transient error. Retrying in ${Math.round(delay)}ms...`);
        await this.sleep(delay);
        return this.withRetry(fn, retries - 1);
      }
      throw mapped;
    }
  }
}

export const geminiService = GeminiService.getInstance();