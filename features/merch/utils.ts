
import { MerchProduct } from '../types';

/**
 * Constructs the prompt for the Gemini model based on inputs.
 */
export const constructMerchPrompt = (
  product: MerchProduct,
  stylePreference: string,
  hasBackground: boolean
): string => {
  const style = stylePreference.trim() || "professional high-quality";
  
  if (hasBackground) {
    return `Image 1 is a logo. Image 2 is a background scene. 
    Generate a ${style} mockup of a ${product.name} (${product.description}) placed naturally in the environment of Image 2. 
    Apply the logo from Image 1 onto the product realistically. 
    Ensure lighting and perspective match the background scene.`;
  }

  return product.defaultPrompt.replace('{style_preference}', style);
};

/**
 * Generates distinct prompts for variations (Lighting & Angles).
 */
export const getVariationPrompts = (
  product: MerchProduct,
  stylePreference: string,
  hasBackground: boolean
): string[] => {
  const basePrompt = constructMerchPrompt(product, stylePreference, hasBackground);
  
  // Variation 1: Cinematic / Dramatic Lighting
  const v1 = `${basePrompt} Use dramatic cinematic lighting with strong contrast and shadows to highlight the texture and logo.`;
  
  // Variation 2: Angled View / Depth
  const v2 = `${basePrompt} Show the product from a dynamic 45-degree angle or slightly high angle to create depth. Soft, diffused daylighting.`;
  
  // Variation 3: Close-up / Detail
  const v3 = `${basePrompt} Focus on a closer shot emphasizing the material quality and the logo application details. Studio lighting.`;

  return [v1, v2, v3];
};

export const getErrorSuggestion = (errorMsg: string, hasBackground: boolean): string => {
  const msg = errorMsg.toLowerCase();
  
  // 1. Safety & Policy
  if (msg.includes("blocked") || msg.includes("safety") || msg.includes("policy") || msg.includes("harmful") || msg.includes("finish reason")) {
      return "Content Safety: The AI blocked generation. This often happens with realistic faces, public figures, restricted symbols, or copyrighted characters. Try a simpler, abstract logo.";
  }

  // 2. Rate Limiting
  if (msg.includes("429") || msg.includes("rate limit") || msg.includes("quota") || msg.includes("too many requests")) {
      return "High Traffic: You've reached the usage limit. Please wait 30-60 seconds before trying again.";
  }

  // 3. Service Overload
  if (msg.includes("503") || msg.includes("overloaded") || msg.includes("unavailable") || msg.includes("capacity")) {
      return "Server Busy: Google's AI model is momentarily overloaded. Please retry in 1-2 minutes.";
  }

  // 4. Authentication
  if (msg.includes("401") || msg.includes("403") || msg.includes("api key") || msg.includes("unauthorized") || msg.includes("access denied")) {
      return "Auth Error: API Key is missing or invalid. Check your .env configuration.";
  }

  // 5. Bad Request / Input
  if (msg.includes("400") || msg.includes("invalid") || msg.includes("bad request") || msg.includes("argument") || msg.includes("unsupported")) {
      if (hasBackground) {
          return "Input Conflict: The custom background or logo format is causing issues. Ensure both are standard RGB PNG/JPG files.";
      }
      return "Image Format: The logo format might be unsupported or corrupted. Try converting to a standard PNG/JPG.";
  }

  // 6. Size / Resolution
  if (msg.includes("size") || msg.includes("large") || msg.includes("payload") || msg.includes("too big") || msg.includes("413") || msg.includes("resolution") || msg.includes("dimension")) {
      return "Image Size: Image might be too large (>5MB) or have extreme dimensions. Resize to ~1024px for best results.";
  }

  // 7. Timeout
  if (msg.includes("timeout") || msg.includes("abort") || msg.includes("cancelled")) {
      return "Timeout: The generation took too long. Check your connection or try a simpler prompt.";
  }

  // 8. Custom Background Specifics
  if (hasBackground && (msg.includes("shape") || msg.includes("mask") || msg.includes("channel"))) {
      return "Incompatible Background: The background image has unusual properties (e.g., CMYK, Alpha channels). Try a standard RGB image.";
  }
  
  // 9. Generic 500
  if (msg.includes("500") || msg.includes("internal") || msg.includes("server error")) {
     return "AI Service Error: Unexpected model error. Retrying often fixes this.";
  }

  return "Tip: Ensure your logo is a clear, high-contrast PNG. If the issue persists, refresh the page.";
};
