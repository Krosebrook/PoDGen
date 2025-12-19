
import { GoogleGenAI, GenerateContentResponse, Part, Type } from "@google/genai";
import { AppError, ApiError, AuthenticationError, SafetyError, RateLimitError } from '../shared/utils/errors';
import { cleanBase64, getMimeType } from '../shared/utils/image';

export type AIModel = 
  | 'gemini-3-flash-preview' 
  | 'gemini-3-pro-preview' 
  | 'gemini-2.5-flash-image' 
  | 'gemini-3-pro-image-preview'
  | 'gemini-2.5-flash-lite-latest';

export type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";
export type ImageSize = "1K" | "2K" | "4K";

export interface AIConfig {
  model: AIModel;
  aspectRatio?: AspectRatio;
  imageSize?: ImageSize;
  thinkingBudget?: number;
  useSearch?: boolean;
  systemInstruction?: string;
}

export interface AIResult {
  text?: string;
  image?: string;
  groundingSources?: any[];
}

class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) AIService.instance = new AIService();
    return AIService.instance;
  }

  private getClient(): GoogleGenAI {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new AuthenticationError("API Key missing.");
    return new GoogleGenAI({ apiKey });
  }

  private mapError(error: any): AppError {
    if (error instanceof AppError) return error;
    const msg = error?.message || String(error);
    const status = error?.status;

    if (status === 429) return new RateLimitError();
    if (status === 401 || status === 403) return new AuthenticationError();
    if (msg.includes("safety")) return new SafetyError();
    return new ApiError(msg, status || 500);
  }

  public async request(
    prompt: string,
    images: string[] = [],
    config: AIConfig
  ): Promise<AIResult> {
    try {
      const ai = this.getClient();
      const parts: Part[] = images.map(img => ({
        inlineData: {
          data: cleanBase64(img),
          mimeType: getMimeType(img),
        }
      }));
      parts.push({ text: prompt });

      const modelConfig: any = {
        systemInstruction: config.systemInstruction,
      };

      if (config.thinkingBudget !== undefined) {
        modelConfig.thinkingConfig = { thinkingBudget: config.thinkingBudget };
      }

      if (config.useSearch) {
        modelConfig.tools = [{ googleSearch: {} }];
      }

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

      const result: AIResult = {};
      
      // Extract Text
      if (response.text) {
        result.text = response.text;
      }

      // Extract Grounding
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        result.groundingSources = response.candidates[0].groundingMetadata.groundingChunks;
      }

      // Extract Image
      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData?.data) {
        result.image = `data:image/png;base64,${imagePart.inlineData.data}`;
      }

      return result;
    } catch (error) {
      throw this.mapError(error);
    }
  }
}

export const aiService = AIService.getInstance();
