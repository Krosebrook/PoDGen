import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { AppError, RateLimitError, SafetyError, ApiError, AuthenticationError, ValidationError, ErrorCode } from '../shared/utils/errors';
import { cleanBase64, getMimeType } from '../shared/utils/image';
import { logger } from '../shared/utils/logger';

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

/**
 * GeminiService: Orchestrates communication with Google Generative AI models.
 * Implements sophisticated error handling, transient fault recovery, and 
 * strict asset validation for high-precision image synthesis.
 */
class GeminiService {
  private static instance: GeminiService;
  
  // Configuration constants
  private readonly MODEL_NAME = "gemini-2.5-flash-image";
  private readonly MAX_RETRIES = 3;
  private readonly BASE_DELAY_MS = 1500;
  private readonly DEFAULT_TIMEOUT_MS = 60000;

  private constructor() {}

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Instantiates the GenAI client using the required naming parameter pattern.
   * Note: The SDK does not support late-binding of keys effectively, so we 
   * instantiate per request or verify validity here.
   */
  private createClient(): GoogleGenAI {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new AuthenticationError("API Configuration missing: process.env.API_KEY is undefined. Ensure the environment is correctly provisioned for the requested model tier.");
    }
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Maps raw API exceptions to granular, user-facing AppError subclasses.
   * This ensures the UI can provide actionable feedback (e.g., retrying vs fixing prompt).
   */
  private static mapError(error: any): AppError {
    if (error instanceof AppError) return error;

    const message = error?.message || String(error);
    const status = error?.status || error?.response?.status;
    const lowerMsg = message.toLowerCase();

    // 1. Connectivity / Lifecycle Errors
    if (error instanceof Error && (error.name === 'AbortError' || lowerMsg.includes('aborted'))) {
      return new ApiError("The request was cancelled before completion. Suggestion: Avoid switching tabs or closing the editor during active synthesis.", 499);
    }
    if (lowerMsg.includes('timeout') || lowerMsg.includes('timed out')) {
      return new ApiError("The AI gateway timed out waiting for a response. Suggestion: Your assets might be too complex for the current regional latency. Try again in a few moments.", 504);
    }

    // 2. Authentication & Authorization (401, 403)
    if (status === 401 || status === 403 || lowerMsg.includes("api key") || lowerMsg.includes("unauthorized") || lowerMsg.includes("forbidden")) {
      return new AuthenticationError("Security handshake failed. Suggestion: Your API key may have expired or lacks permissions for the 2.5/3.0 model series. Check your Google AI Studio project status.");
    }

    // 3. Resource & Rate Limits (429)
    if (status === 429 || lowerMsg.includes("quota") || lowerMsg.includes("rate limit") || lowerMsg.includes("too many requests")) {
      return new RateLimitError();
    }

    // 4. Safety & Content Policies
    if (
      lowerMsg.includes("safety") || 
      lowerMsg.includes("blocked") || 
      lowerMsg.includes("finishreason: safety") ||
      lowerMsg.includes("policy") ||
      lowerMsg.includes("restricted")
    ) {
      return new SafetyError("The generation was interrupted by the AI safety layer. Suggestion: This often happens with human figures or sensitive brand elements. Try a more abstract prompt or a different brand asset.");
    }

    // 5. Client-Side Validation (400)
    if (status === 400 || lowerMsg.includes("invalid") || lowerMsg.includes("unsupported")) {
      return new ValidationError(`The request payload is invalid. Suggestion: Verify your image is within 256px - 4096px and is in a standard web format like PNG or JPG.`);
    }

    // 6. Server-Side / Capacity Errors (500, 503)
    if (status === 503 || lowerMsg.includes("overloaded") || lowerMsg.includes("capacity") || lowerMsg.includes("service unavailable")) {
      return new ApiError("AI Engine Overload: The regional processing cluster is at capacity. Suggestion: We are queueing requests; please wait 15 seconds before retrying.", 503);
    }

    // Default Fallback
    return new ApiError(`Synthesis failure: ${message}. Suggestion: Refresh the application if the issue persists across different assets.`, status || 500);
  }

  /**
   * Implementation of exponential backoff with jitter for transient network or capacity failures.
   */
  private async withRetry<T>(fn: () => Promise<T>, retries = this.MAX_RETRIES, delay = this.BASE_DELAY_MS): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const mappedError = GeminiService.mapError(error);
      
      // Do not retry on non-transient or definitive errors
      const isTransient = (
        mappedError instanceof RateLimitError || 
        (mappedError instanceof ApiError && (mappedError.statusCode === 503 || mappedError.statusCode === 504)) ||
        mappedError.message.includes('overloaded')
      );

      if (retries > 0 && isTransient) {
        const jitter = Math.random() * 500;
        const nextDelay = delay * 2 + jitter;
        logger.warn(`Gemini Gateway: Transient error detected. Retrying attempt ${this.MAX_RETRIES - retries + 1}/${this.MAX_RETRIES}. Next try in ${Math.round(nextDelay)}ms.`);
        await new Promise(resolve => setTimeout(resolve, nextDelay));
        return this.withRetry(fn, retries - 1, nextDelay);
      }
      
      throw mappedError;
    }
  }

  /**
   * Pre-flight validation for uploaded images.
   */
  private validateImage(b64: string, label: string) {
    if (!b64 || typeof b64 !== 'string' || !b64.startsWith('data:image/')) {
      throw new ValidationError(`Invalid ${label} data. Suggestion: Ensure the file is a valid image and correctly read into memory.`);
    }

    const mime = getMimeType(b64);
    if (!SUPPORTED_INPUT_MIMES.includes(mime)) {
      throw new ValidationError(`Unsupported format for ${label}: ${mime.split('/')[1].toUpperCase()}. Suggestion: Use PNG for logos (supports transparency) or high-quality JPG for backgrounds.`);
    }

    // Check for obviously truncated base64
    if (b64.length < 100) {
      throw new ValidationError(`The ${label} asset appears to be corrupted or too small. Suggestion: Re-upload the file.`);
    }
  }

  /**
   * Main entry point for image generation and contextual editing.
   */
  public async generateOrEditImage(
    mainImageBase64: string,
    prompt: string,
    additionalImagesBase64: string[] = [],
    options: RequestOptions = {}
  ): Promise<string> {
    const { signal, timeout = this.DEFAULT_TIMEOUT_MS } = options;

    // 1. Upfront Validation
    this.validateImage(mainImageBase64, "primary asset");
    additionalImagesBase64.forEach((img, i) => this.validateImage(img, `context asset ${i + 1}`));

    return this.withRetry(async () => {
      if (signal?.aborted) throw new Error("Request aborted");

      const ai = this.createClient();
      
      const parts: Part[] = [];
      // Primary image
      parts.push({
        inlineData: {
          data: cleanBase64(mainImageBase64),
          mimeType: getMimeType(mainImageBase64),
        },
      });
      // Contextual images
      additionalImagesBase64.forEach((img) => {
        parts.push({
          inlineData: {
            data: cleanBase64(img),
            mimeType: getMimeType(img),
          },
        });
      });
      // Instruction
      parts.push({ text: prompt });

      // Race against timeout
      const generatePromise = ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: { parts },
      });

      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out during synthesis")), timeout)
      );

      try {
        const response: GenerateContentResponse = await Promise.race([
          generatePromise,
          timeoutPromise
        ]);

        const candidate = response.candidates?.[0];
        if (!candidate) {
          throw new ApiError("The AI model returned an empty response with no candidates. Suggestion: Try adjusting your prompt to be more descriptive.", 500);
        }

        if (candidate.finishReason === "SAFETY") {
          throw new SafetyError();
        }

        const imagePart = candidate.content?.parts.find(p => p.inlineData && p.inlineData.data);
        if (imagePart?.inlineData?.data) {
          return `data:image/png;base64,${imagePart.inlineData.data}`;
        }

        if (candidate.content?.parts.find(p => p.text)) {
           throw new ApiError("The AI engine returned a text response instead of an image. Suggestion: Your prompt might be asking a question instead of giving a visual instruction.", 422);
        }

        throw new ApiError("Image synthesis successful but no raster data was returned in the response stream.", 500);
      } catch (err) {
        throw GeminiService.mapError(err);
      }
    });
  }

  /**
   * Batch generation utility for variation synthesis.
   */
  public async generateImageBatch(
    mainImageBase64: string,
    prompts: string[],
    additionalImagesBase64: string[] = [],
    options: RequestOptions = {}
  ): Promise<string[]> {
    const promises = prompts.map(prompt => 
      this.generateOrEditImage(mainImageBase64, prompt, additionalImagesBase64, options)
        .catch(err => {
          logger.error(`Batch Synthesis Node Failed for prompt fragment: ${prompt.substring(0, 40)}...`, err);
          return null; 
        })
    );

    const results = await Promise.all(promises);
    return results.filter((res): res is string => res !== null);
  }
}

// Facade exports for app-wide use
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
