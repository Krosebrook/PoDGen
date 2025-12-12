
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AppError, ErrorCode, RateLimitError, SafetyError, ApiError, AuthenticationError } from '../shared/utils/errors';
import { cleanBase64, getMimeType } from '../shared/utils/image';

class GeminiService {
  private static instance: GeminiService;
  private client: GoogleGenAI | null = null;
  private readonly MODEL_NAME = "gemini-2.5-flash-image";

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

  /**
   * Maps raw Gemini/Fetch errors to domain AppError types.
   */
  private mapError(error: any): AppError {
    if (error instanceof AppError) return error;

    const msg = error.message || String(error);
    const status = error.status || error.response?.status;

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

  /**
   * Generates or edits an image using Gemini.
   */
  public async generateOrEditImage(
    mainImageBase64: string,
    prompt: string,
    additionalImagesBase64: string[] = []
  ): Promise<string> {
    try {
      const ai = this.getClient();
      const parts: any[] = [];

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

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: {
          parts: parts,
        },
      });

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
      
    } catch (error: any) {
      console.error("Gemini Service Error:", error);
      throw this.mapError(error);
    }
  }

  /**
   * Generates multiple variations in parallel.
   */
  public async generateImageBatch(
    mainImageBase64: string,
    prompts: string[],
    additionalImagesBase64: string[] = []
  ): Promise<string[]> {
    // Execute all requests in parallel
    const promises = prompts.map(prompt => 
      this.generateOrEditImage(mainImageBase64, prompt, additionalImagesBase64)
        .catch(err => {
          console.warn(`Variation failed for prompt "${prompt}":`, err);
          return null; // Return null for failed variations to filter later
        })
    );

    const results = await Promise.all(promises);
    return results.filter((res): res is string => res !== null);
  }
}

// Export singleton instance method wrappers
export const generateOrEditImage = (
  mainImageBase64: string,
  prompt: string,
  additionalImagesBase64: string[] = []
) => GeminiService.getInstance().generateOrEditImage(mainImageBase64, prompt, additionalImagesBase64);

export const generateImageBatch = (
  mainImageBase64: string,
  prompts: string[],
  additionalImagesBase64: string[] = []
) => GeminiService.getInstance().generateImageBatch(mainImageBase64, prompts, additionalImagesBase64);
