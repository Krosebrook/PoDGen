
import { GoogleGenAI } from "@google/genai";
import { AppError, ErrorCode, RateLimitError, SafetyError, ApiError, AuthenticationError } from '../shared/utils/errors';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new AuthenticationError("API Key is missing. Please ensure process.env.API_KEY is available.");
  }
  return new GoogleGenAI({ apiKey });
};

// Remove standard base64 prefix
const cleanBase64 = (b64: string) => {
  return b64.replace(/^data:image\/(png|jpeg|jpg|webp|heic);base64,/, "");
};

// Robustly detect mime type from base64 header
const getMimeType = (b64: string): string => {
  const match = b64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  return match ? match[1] : 'image/png';
};

/**
 * Maps raw Gemini/Fetch errors to domain AppError types.
 */
const mapGeminiError = (error: any): AppError => {
  if (error instanceof AppError) return error;

  const msg = error.message || String(error);
  const status = error.status || error.response?.status;

  // Handle specific HTTP Status Codes if available
  if (status === 429 || msg.includes("429")) {
    return new RateLimitError();
  }
  
  if (status === 401 || status === 403 || msg.includes("401") || msg.includes("403") || msg.toLowerCase().includes("api key")) {
    return new AuthenticationError("Access denied. Please check your API key configuration.");
  }

  if (status === 503 || msg.includes("503") || msg.includes("overloaded")) {
    return new ApiError("The model is currently overloaded. Please try again in a few moments.", 503);
  }

  // Handle Content Safety / Policy Errors
  if (
    msg.toLowerCase().includes("safety") || 
    msg.toLowerCase().includes("blocked") || 
    msg.toLowerCase().includes("policy")
  ) {
    return new SafetyError("The request was blocked by safety filters. Please verify your prompt and source image.");
  }

  // Handle Invalid Requests
  if (status === 400 || msg.includes("400")) {
    return new ApiError("Invalid request. The image format or prompt might be unsupported.", 400);
  }

  // Fallback
  return new ApiError(msg, status || 500);
};

/**
 * Generates or edits an image using Gemini.
 * @param mainImageBase64 The primary image.
 * @param prompt The text instruction.
 * @param additionalImagesBase64 Optional array of secondary images.
 */
export const generateOrEditImage = async (
  mainImageBase64: string,
  prompt: string,
  additionalImagesBase64: string[] = []
): Promise<string> => {
  try {
    const ai = getClient();
    const model = "gemini-2.5-flash-image";

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

    const response = await ai.models.generateContent({
      model,
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
        
        // If we have candidates but no image part, check finishReason
        const finishReason = response.candidates[0].finishReason;
        if (finishReason === "SAFETY") {
          throw new SafetyError("Generation stopped due to safety concerns.");
        }
    }
    
    throw new ApiError("No image generated. The model returned a response without image data.", 422);
    
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw mapGeminiError(error);
  }
};
