
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
  
  return [
    `${basePrompt} Photorealistic product shot with warm golden hour sunlight coming from the side. Soft shadows, natural vibe.`,
    `${basePrompt} Studio photography setup with cool-toned rim lighting to accentuate the edges. High contrast, professional look.`,
    `${basePrompt} A perfectly symmetrical top-down flat lay view. Even, diffused lighting, organized composition.`,
    `${basePrompt} An isometric 45-degree angle view showing depth and dimension. Sharp focus, clean background.`,
    `${basePrompt} A macro close-up shot focused specifically on the logo texture and material quality. Shallow depth of field.`
  ];
};

/**
 * Analyzes error messages to provide actionable user suggestions.
 */
export const getErrorSuggestion = (errorMsg: string, hasBackground: boolean): string => {
  const msg = errorMsg.toLowerCase();
  
  // 1. Safety & Policy - Specific Triggers
  if (msg.includes("copyright") || msg.includes("intellectual property")) {
    return "Policy Limit: The model detected potential copyrighted imagery. Please try a different or original logo.";
  }
  
  if (msg.includes("face") || msg.includes("person") || msg.includes("identity")) {
    return "Privacy Limit: The model is restricted from generating images of real people. Try using a product-only background.";
  }

  if (msg.includes("blocked") || msg.includes("safety") || msg.includes("policy") || msg.includes("harmful") || msg.includes("finish reason")) {
      return "Content Safety: The generation was stopped by safety filters. This can happen with complex shapes interpreted as sensitive. Try a simplified version of your logo.";
  }

  // 2. Rate Limiting
  if (msg.includes("429") || msg.includes("rate limit") || msg.includes("quota") || msg.includes("too many requests")) {
      return "High Traffic: You've reached the usage limit. Please wait 30-60 seconds before trying again to let your quota reset.";
  }

  // 3. Service Overload
  if (msg.includes("503") || msg.includes("overloaded") || msg.includes("unavailable") || msg.includes("capacity")) {
      return "Server Busy: Google's AI model is momentarily overloaded. Please retry in 1-2 minutes.";
  }

  // 4. Authentication
  if (msg.includes("401") || msg.includes("403") || msg.includes("api key") || msg.includes("unauthorized") || msg.includes("access denied")) {
      return "Auth Error: API Key is missing or invalid. Check your .env configuration.";
  }

  // 5. Image Format & Encoding
  if (msg.includes("decode") || msg.includes("base64") || msg.includes("corrupt")) {
    return "File Error: The image file appears corrupted or could not be processed. Please re-save it as a standard PNG or JPG and upload again.";
  }

  // 6. Bad Request / Input
  if (msg.includes("400") || msg.includes("invalid") || msg.includes("bad request") || msg.includes("argument") || msg.includes("unsupported")) {
      if (hasBackground) {
          return "Input Conflict: The combination of logo and background might be causing issues. Ensure both are standard RGB images without complex alpha channels.";
      }
      return "Image Format: The logo format might be unsupported. Try converting to a standard PNG/JPG.";
  }

  // 7. Size / Resolution
  if (msg.includes("too small") || msg.includes("resolution") || msg.includes("dimension")) {
     return "Resolution Low: Your logo image might be too small for high-quality generation. Try using an image at least 512x512 pixels.";
  }

  if (msg.includes("size") || msg.includes("large") || msg.includes("payload") || msg.includes("too big") || msg.includes("413")) {
      return "File Too Large: The image data exceeds the API limit (approx 4MB). Please resize your image or compress it before uploading.";
  }

  // 8. Timeout
  if (msg.includes("timeout") || msg.includes("abort") || msg.includes("cancelled")) {
      return "Timeout: The generation took too long. Check your internet connection or try a simpler prompt style.";
  }

  // 9. Custom Background Specifics
  if (hasBackground && (msg.includes("shape") || msg.includes("mask") || msg.includes("channel"))) {
      return "Background Issue: The background image has unusual properties (e.g., CMYK color space). Try converting it to RGB.";
  }
  
  // 10. Generic 500
  if (msg.includes("500") || msg.includes("internal") || msg.includes("server error")) {
     return "AI Service Error: Unexpected model error. Retrying often fixes this.";
  }

  return "Suggestion: Ensure your logo is a clear, high-contrast PNG/JPG. If the issue persists, try refreshing the page.";
};
