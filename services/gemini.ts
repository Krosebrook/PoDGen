
import { GoogleGenAI } from "@google/genai";
import { AppError, ErrorCode, RateLimitError, SafetyError, ApiError } from '../shared/utils/errors';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new AppError(
      "API Key is missing. Please ensure process.env.API_KEY is available.",
      ErrorCode.AUTHENTICATION_ERROR,
      401
    );
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
  const ai = getClient();
  const model = "gemini-2.5-flash-image";

  try {
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
    }
    
    throw new ApiError("No image generated. The model might have refused the request or returned only text content.", 422);
    
  } catch (error: any) {
    console.error("Gemini API Error:", error);

    // Map errors to AppError types
    if (error instanceof AppError) throw error;

    const msg = error.message || String(error);

    if (msg.includes("429")) {
      throw new RateLimitError();
    }
    if (msg.toLowerCase().includes("safety") || msg.toLowerCase().includes("blocked")) {
      throw new SafetyError(msg);
    }
    if (msg.toLowerCase().includes("api key") || msg.includes("403")) {
      throw new AppError("Invalid or missing API Key.", ErrorCode.AUTHENTICATION_ERROR, 403);
    }

    throw new ApiError(msg);
  }
};
