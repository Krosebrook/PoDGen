
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { AppError, RateLimitError, SafetyError, ApiError, AuthenticationError, ValidationError } from '../shared/utils/errors';
import { cleanBase64, getMimeType } from '../shared/utils/image';

interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
}

interface ImagePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

interface TextPart {
  text: string;
}

type ModelPart = ImagePart | TextPart;

const SUPPORTED_INPUT_MIMES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic'];

class GeminiService {
  private static instance: GeminiService;
  private client: GoogleGenAI | null = null;
  
  // Configuration constants
  private readonly MODEL_NAME = "gemini-2.5-flash-image";
  private readonly MAX_RETRIES = 3;
  private readonly BASE_DELAY_MS = 1000;
  private readonly DEFAULT_TIMEOUT_MS = 60000;

  private constructor() {}

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Lazy initialization of the GenAI client.
   * Throws AuthenticationError if API key is missing.
   */
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

  /**
   * Maps unknown errors to typed AppError instances.
   */
  private static mapError(error: unknown): AppError {
    if (error instanceof AppError) return error;

    const msg = error instanceof Error ? error.message : String(error);
    const status = (error as any)?.status || (error as any)?.response?.status;
    const lowerMsg = msg.toLowerCase();

    if (error instanceof Error && (error.name === 'AbortError' || msg.includes('aborted'))) {
      return new ApiError("Request cancelled by user.", 499);
    }

    if (status === 429 || msg.includes("429")) {
      return new RateLimitError();
    }
    
    if (status === 401 || status === 403 || lowerMsg.includes("api key") || lowerMsg.includes("authentication")) {
      return new AuthenticationError("Access denied. Please check your API key configuration and project permissions.");
    }

    if (status === 503 || lowerMsg.includes("503") || lowerMsg.includes("overloaded") || lowerMsg.includes("capacity")) {
      return new ApiError("The AI model is currently at maximum capacity. Please wait a moment before retrying.", 503);
    }

    if (
      lowerMsg.includes("safety") || 
      lowerMsg.includes("blocked") || 
      lowerMsg.includes("policy") ||
      lowerMsg.includes("restricted")
    ) {
      return new SafetyError("The request was blocked by Gemini safety filters. This often happens with human faces or sensitive branding. Try simplifying your prompt.");
    }

    if (status === 400 || lowerMsg.includes("400") || lowerMsg.includes("invalid") || lowerMsg.includes("format")) {
      return new ApiError(`Invalid request: ${msg}. Verify image formats and prompt complexity.`, 400);
    }

    return new ApiError(msg, status || 500);
  }

  /**
   * Executes a function with exponential backoff retry logic.
   */
  private async withRetry<T>(fn: () => Promise<T>, retries = this.MAX_RETRIES, delay = this.BASE_DELAY_MS): Promise<T> {
    try {
      return await fn();
    } catch (error: unknown) {
      const mappedError = GeminiService.mapError(error);
      
      // Non-retriable errors
      if (
        mappedError instanceof AuthenticationError ||
        mappedError instanceof SafetyError || 
        mappedError instanceof ValidationError ||
        (mappedError instanceof ApiError && mappedError.statusCode === 499) ||
        (mappedError instanceof ApiError && mappedError.statusCode === 400)
      ) {
        throw mappedError;
      }

      // Retry on Rate Limit (429) or Service Unavailable (503)
      if (retries > 0 && (mappedError instanceof RateLimitError || (mappedError instanceof ApiError && mappedError.statusCode === 503))) {
        // Add jitter to delay
        const jitter = Math.random() * 200;
        await new Promise(resolve => setTimeout(resolve, delay + jitter));
        return this.withRetry(fn, retries - 1, delay * 2);
      }
      
      throw mappedError;
    }
  }

  private validateImageFormat(b64: string) {
    const mime = getMimeType(b64);
    if (!SUPPORTED_INPUT_MIMES.includes(mime)) {
      throw new ValidationError(`Unsupported image format: ${mime}. Gemini currently supports: ${SUPPORTED_INPUT_MIMES.join(', ')}.`);
    }
  }

  /**
   * Constructs the payload parts for the API request.
   */
  private buildParts(mainImageBase64: string, prompt: string, additionalImagesBase64: string[]): ModelPart[] {
    const parts: ModelPart[] = [];

    // 1. Main Image
    this.validateImageFormat(mainImageBase64);
    parts.push({
      inlineData: {
        data: cleanBase64(mainImageBase64),
        mimeType: getMimeType(mainImageBase64),
      },
    });

    // 2. Additional Images
    additionalImagesBase64.forEach((img) => {
      this.validateImageFormat(img);
      parts.push({
        inlineData: {
          data: cleanBase64(img),
          mimeType: getMimeType(img),
        },
      });
    });

    // 3. Text Prompt
    parts.push({ text: prompt });

    return parts;
  }

  public async generateOrEditImage(
    mainImageBase64: string,
    prompt: string,
    additionalImagesBase64: string[] = [],
    options: RequestOptions = {}
  ): Promise<string> {
    const { signal, timeout = this.DEFAULT_TIMEOUT_MS } = options;

    return this.withRetry(async () => {
      if (signal?.aborted) {
        throw new Error("Request aborted");
      }

      const ai = this.getClient();
      const parts = this.buildParts(mainImageBase64, prompt, additionalImagesBase64);

      const generatePromise = ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: { parts: parts as Part[] }, // Cast strictly compliant Part
      });

      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out")), timeout)
      );

      // Handle AbortSignal race
      const abortPromise = new Promise<never>((_, reject) => {
        if (signal) {
          signal.addEventListener('abort', () => reject(new Error("Request aborted")), { once: true });
        }
      });

      try {
        const response: GenerateContentResponse = await Promise.race([
          generatePromise,
          timeoutPromise,
          abortPromise
        ]);

        if (response.candidates && response.candidates.length > 0) {
          const contentParts = response.candidates[0].content?.parts;
          if (contentParts) {
            for (const part of contentParts) {
              if (part.inlineData && part.inlineData.data) {
                return `data:image/png;base64,${part.inlineData.data}`;
              }
            }
          }
          
          if (response.candidates[0].finishReason === "SAFETY") {
            throw new SafetyError("Generation was blocked by Google's safety policy. This usually happens if the AI detects faces, people, or restricted branding in the source or generated result.");
          }
        }
        
        throw new ApiError("No image was synthesized. The model returned a valid response but without image fragments.", 422);
      } finally {
        // Cleanup handled by promise racing
      }
    });
  }

  public async generateImageBatch(
    mainImageBase64: string,
    prompts: string[],
    additionalImagesBase64: string[] = [],
    options: RequestOptions = {}
  ): Promise<string[]> {
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

// Facade exports for cleaner consumption
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
