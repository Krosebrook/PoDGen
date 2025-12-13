
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { AppError, RateLimitError, SafetyError, ApiError, AuthenticationError } from '../shared/utils/errors';
import { cleanBase64, getMimeType } from '../shared/utils/image';

interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
}

class GeminiService {
  private static instance: GeminiService;
  private client: GoogleGenAI | null = null;
  private readonly MODEL_NAME = "gemini-2.5-flash-image";
  private readonly MAX_RETRIES = 3;
  private readonly BASE_DELAY = 1000;
  private readonly DEFAULT_TIMEOUT = 60000; // 60 seconds

  private constructor() {}

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  private getClient(): GoogleGenAI {
    if (!this.client) {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new AuthenticationError("API Key is missing. Please ensure process.env.API_KEY is available.");
      }
      this.client = new GoogleGenAI({ apiKey });
    }
    return this.client;
  }

  private mapError(error: any): AppError {
    if (error instanceof AppError) return error;

    const msg = error.message || String(error);
    const status = error.status || error.response?.status;

    if (error.name === 'AbortError' || msg.includes('aborted')) {
      return new ApiError("Request cancelled by user.", 499);
    }

    if (status === 429 || msg.includes("429")) {
      return new RateLimitError();
    }
    
    if (status === 401 || status === 403 || msg.includes("401") || msg.includes("403") || msg.toLowerCase().includes("api key")) {
      return new AuthenticationError("Access denied. Please check your API key configuration.");
    }

    if (status === 503 || msg.includes("503") || msg.includes("overloaded")) {
      return new ApiError("The model is currently overloaded. Please try again in a few moments.", 503);
    }

    if (
      msg.toLowerCase().includes("safety") || 
      msg.toLowerCase().includes("blocked") || 
      msg.toLowerCase().includes("policy")
    ) {
      return new SafetyError("The request was blocked by safety filters. Please verify your prompt and source image.");
    }

    if (status === 400 || msg.includes("400")) {
      return new ApiError("Invalid request. The image format or prompt might be unsupported.", 400);
    }

    return new ApiError(msg, status || 500);
  }

  private async withRetry<T>(fn: () => Promise<T>, retries = this.MAX_RETRIES, delay = this.BASE_DELAY): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const mappedError = this.mapError(error);
      
      // Don't retry if aborted or safety error or auth error
      if (
        mappedError instanceof AuthenticationError ||
        mappedError instanceof SafetyError || 
        (mappedError instanceof ApiError && mappedError.statusCode === 499)
      ) {
        throw mappedError;
      }

      // Retry on Rate Limit (429) or Service Unavailable (503)
      if (retries > 0 && (mappedError instanceof RateLimitError || (mappedError instanceof ApiError && mappedError.statusCode === 503))) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(fn, retries - 1, delay * 2);
      }
      
      throw mappedError;
    }
  }

  public async generateOrEditImage(
    mainImageBase64: string,
    prompt: string,
    additionalImagesBase64: string[] = [],
    options: RequestOptions = {}
  ): Promise<string> {
    const { signal, timeout = this.DEFAULT_TIMEOUT } = options;

    return this.withRetry(async () => {
      // Check abort signal before starting
      if (signal?.aborted) {
        throw new Error("Request aborted");
      }

      const ai = this.getClient();
      const parts: Part[] = [];

      // 1. Add Main Image
      parts.push({
        inlineData: {
          data: cleanBase64(mainImageBase64),
          mimeType: getMimeType(mainImageBase64),
        },
      });

      // 2. Add Additional Images
      additionalImagesBase64.forEach((img) => {
        parts.push({
          inlineData: {
            data: cleanBase64(img),
            mimeType: getMimeType(img),
          },
        });
      });

      // 3. Add Prompt
      parts.push({ text: prompt });

      // Create a timeout race
      const generatePromise = ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: { parts },
      });

      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out")), timeout)
      );

      // Handle AbortSignal during fetch (if SDK supports it, otherwise we simulate)
      const abortPromise = new Promise<never>((_, reject) => {
        if (signal) {
          signal.addEventListener('abort', () => reject(new Error("Request aborted")));
        }
      });

      const response: GenerateContentResponse = await Promise.race([
        generatePromise,
        timeoutPromise,
        abortPromise
      ]);

      // Parse the response
      if (response.candidates && response.candidates.length > 0) {
          const contentParts = response.candidates[0].content?.parts;
          if (contentParts) {
              for (const part of contentParts) {
                  if (part.inlineData && part.inlineData.data) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                  }
              }
          }
          
          const finishReason = response.candidates[0].finishReason;
          if (finishReason === "SAFETY") {
            throw new SafetyError("Generation stopped due to safety concerns.");
          }
      }
      
      throw new ApiError("No image generated. The model returned a response without image data.", 422);
    });
  }

  public async generateImageBatch(
    mainImageBase64: string,
    prompts: string[],
    additionalImagesBase64: string[] = [],
    options: RequestOptions = {}
  ): Promise<string[]> {
    // Execute all requests in parallel
    const promises = prompts.map(prompt => 
      this.generateOrEditImage(mainImageBase64, prompt, additionalImagesBase64, options)
        .catch(err => {
          console.warn(`Variation failed for prompt "${prompt}":`, err);
          return null; 
        })
    );

    const results = await Promise.all(promises);
    return results.filter((res): res is string => res !== null);
  }
}

export const generateOrEditImage = (
  mainImageBase64: string,
  prompt: string,
  additionalImagesBase64: string[] = [],
  options?: RequestOptions
) => GeminiService.getInstance().generateOrEditImage(mainImageBase64, prompt, additionalImagesBase64, options);

export const generateImageBatch = (
  mainImageBase64: string,
  prompts: string[],
  additionalImagesBase64: string[] = [],
  options?: RequestOptions
) => GeminiService.getInstance().generateImageBatch(mainImageBase64, prompts, additionalImagesBase64, options);
