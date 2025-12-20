
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { AppError, ApiError, AuthenticationError, SafetyError, RateLimitError } from '../shared/utils/errors';
import { cleanBase64, getMimeType } from '../shared/utils/image';
import { logger } from '../shared/utils/logger';

export type AIModel = 
  | 'gemini-3-flash-preview' 
  | 'gemini-3-pro-preview' 
  | 'gemini-2.5-flash-image' 
  | 'gemini-3-pro-image-preview'
  | 'gemini-2.5-flash-lite-latest'
  | 'veo-3.1-fast-generate-preview'
  | 'gemini-2.5-flash-preview-tts';

export type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";
export type ImageSize = "1K" | "2K" | "4K";

export interface AIConfig {
  model: AIModel;
  aspectRatio?: AspectRatio;
  imageSize?: ImageSize;
  thinkingBudget?: number;
  maxOutputTokens?: number;
  useSearch?: boolean;
  systemInstruction?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxRetries?: number;
}

export interface AIResult {
  text?: string;
  image?: string;
  groundingSources?: any[];
  finishReason?: string;
}

class AIService {
  private static instance: AIService;
  private readonly DEFAULT_MAX_RETRIES = 2;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) AIService.instance = new AIService();
    return AIService.instance;
  }

  /**
   * Initializes the Gemini client with the secure environment key.
   */
  private getClient(): GoogleGenAI {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new AuthenticationError("API_KEY_NOT_FOUND: Ensure process.env.API_KEY is configured.");
    }
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Maps internal SDK/API errors to application-specific error types.
   */
  private mapError(error: any): AppError {
    if (error instanceof AppError) return error;
    
    const status = error?.status || error?.response?.status;
    const msg = error?.message || String(error);

    if (status === 429) return new RateLimitError();
    if (status === 401 || status === 403) return new AuthenticationError("AI Authentication Failed: Invalid API Key.");
    if (msg.toLowerCase().includes("safety")) return new SafetyError("Pipeline Interrupted: Content violates safety policies.");
    if (status === 503 || status === 504 || msg.toLowerCase().includes("overloaded")) {
      return new ApiError("Upstream Capacity Reached: AI Service is currently overloaded.", 503);
    }
    
    return new ApiError(msg, status || 500);
  }

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execution wrapper with exponential backoff and jitter.
   */
  private async withRetry<T>(fn: () => Promise<T>, maxRetries: number): Promise<T> {
    let lastError: any;
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        const normalized = this.mapError(err);
        
        // Finalize on non-retriable errors
        if (normalized instanceof SafetyError || normalized instanceof AuthenticationError) {
          throw normalized;
        }

        if (i < maxRetries) {
          const delay = Math.pow(2, i) * 1000 + (Math.random() * 500);
          logger.warn(`AI Gateway: Request failed (attempt ${i + 1}/${maxRetries + 1}). Retrying in ${Math.round(delay)}ms...`);
          await this.sleep(delay);
          continue;
        }
      }
    }
    throw this.mapError(lastError);
  }

  /**
   * Standard content generation for text and images.
   */
  public async request(
    prompt: string,
    images: string[] = [],
    config: AIConfig
  ): Promise<AIResult> {
    const maxRetries = config.maxRetries ?? this.DEFAULT_MAX_RETRIES;

    return this.withRetry(async () => {
      const ai = this.getClient();
      const parts: Part[] = images.filter(Boolean).map(img => ({
        inlineData: {
          data: cleanBase64(img),
          mimeType: getMimeType(img),
        }
      }));
      parts.push({ text: prompt });

      const modelConfig: any = {
        systemInstruction: config.systemInstruction,
        temperature: config.temperature,
        topP: config.topP,
        topK: config.topK,
      };

      // Coordinate Thinking Budget with Output Tokens
      if (config.thinkingBudget !== undefined) {
        modelConfig.thinkingConfig = { thinkingBudget: config.thinkingBudget };
        if (config.maxOutputTokens) {
          modelConfig.maxOutputTokens = config.maxOutputTokens;
        }
      } else if (config.maxOutputTokens) {
        modelConfig.maxOutputTokens = config.maxOutputTokens;
      }

      if (config.useSearch) {
        modelConfig.tools = [{ googleSearch: {} }];
      }

      // Handle Image Generation Model Specifics
      if (config.model.includes('image')) {
        modelConfig.imageConfig = {
          aspectRatio: config.aspectRatio || "1:1",
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

      const result: AIResult = {
        finishReason: response.candidates?.[0]?.finishReason
      };
      
      if (response.text) {
        result.text = response.text;
      }

      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        result.groundingSources = response.candidates[0].groundingMetadata.groundingChunks;
      }

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData?.data) {
        result.image = `data:image/png;base64,${imagePart.inlineData.data}`;
      }

      return result;
    }, maxRetries);
  }

  /**
   * Low-latency streaming interface for incremental text responses.
   */
  public async *stream(
    prompt: string,
    images: string[] = [],
    config: AIConfig
  ): AsyncGenerator<string, void, unknown> {
    const ai = this.getClient();
    const parts: Part[] = images.filter(Boolean).map(img => ({
      inlineData: {
        data: cleanBase64(img),
        mimeType: getMimeType(img),
      }
    }));
    parts.push({ text: prompt });

    const modelConfig: any = {
      systemInstruction: config.systemInstruction,
      temperature: config.temperature ?? 0.7,
    };

    if (config.thinkingBudget !== undefined) {
      modelConfig.thinkingConfig = { thinkingBudget: config.thinkingBudget };
      if (config.maxOutputTokens) modelConfig.maxOutputTokens = config.maxOutputTokens;
    }

    try {
      const responseStream = await ai.models.generateContentStream({
        model: config.model,
        contents: { parts },
        config: modelConfig,
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    } catch (error) {
      logger.error("AI Streaming Pipeline Failed:", error);
      throw this.mapError(error);
    }
  }
}

export const aiService = AIService.getInstance();
