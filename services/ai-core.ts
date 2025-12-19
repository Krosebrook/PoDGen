
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { AppError, ApiError, AuthenticationError, SafetyError, RateLimitError } from '../shared/utils/errors';
import { cleanBase64, getMimeType } from '../shared/utils/image';
import { logger } from '../shared/utils/logger';

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
}

export interface AIResponse {
  text?: string;
  image?: string;
  groundingSources?: any[];
  finishReason?: string;
}

class AICoreService {
  private static instance: AICoreService;
  private readonly DEFAULT_RETRIES = 2;

  private constructor() {}

  public static getInstance(): AICoreService {
    if (!AICoreService.instance) AICoreService.instance = new AICoreService();
    return AICoreService.instance;
  }

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

    if (status === 429) return new RateLimitError();
    if (status === 401 || status === 403) return new AuthenticationError();
    if (message.toLowerCase().includes("safety")) return new SafetyError("Safety policy violation detected at current depth.");
    return new ApiError(message, status || 500);
  }

  public async generate(
    prompt: string,
    images: string[] = [],
    config: AIRequestConfig
  ): Promise<AIResponse> {
    const retries = config.maxRetries ?? this.DEFAULT_RETRIES;
    let lastError: any;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const apiKey = this.getApiKey();
        return await this.executeRequest(apiKey, prompt, images, config);
      } catch (error) {
        lastError = error;
        const normalized = this.normalizeError(error);
        if (normalized instanceof SafetyError || normalized instanceof AuthenticationError) throw normalized;

        if (attempt < retries) {
          await this.sleep(Math.pow(2, attempt) * 1000);
          continue;
        }
      }
    }
    throw this.normalizeError(lastError);
  }

  private async executeRequest(
    apiKey: string,
    prompt: string,
    images: string[] = [],
    config: AIRequestConfig
  ): Promise<AIResponse> {
    const ai = new GoogleGenAI({ apiKey });
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

    // EDGE CASE: Thinking Budget Coordination
    // If maxOutputTokens is provided, we must ensure thinkingBudget is lower to avoid empty responses.
    if (config.thinkingBudget !== undefined) {
      const budget = config.thinkingBudget;
      generationConfig.thinkingConfig = { thinkingBudget: budget };
      if (config.maxOutputTokens) {
        // Reserve at least 25% for output if not specified
        generationConfig.maxOutputTokens = Math.max(config.maxOutputTokens, budget + 100);
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
