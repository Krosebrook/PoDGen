import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is available.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to convert base64 to the format expected by the SDK if needed, 
// though the SDK handles base64 in parts well.
// We expect standard base64 strings (without the data:image/png;base64, prefix sometimes, but SDK wants clean base64)
const cleanBase64 = (b64: string) => {
  return b64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
};

const getMimeType = (b64: string) => {
  const match = b64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  return match ? match[1] : 'image/png';
};

export const generateOrEditImage = async (
  imageBase64: string,
  prompt: string
): Promise<string> => {
  const ai = getClient();
  const model = "gemini-2.5-flash-image";

  const cleanData = cleanBase64(imageBase64);
  const mimeType = getMimeType(imageBase64);

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      // Note: responseMimeType is not supported for nano banana models
    });

    // Parse the response to find the image part
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          // Construct a data URL for the frontend to display
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    // Fallback if no image found (might be text refusal)
    throw new Error("No image generated. The model might have refused the request or returned only text.");
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};