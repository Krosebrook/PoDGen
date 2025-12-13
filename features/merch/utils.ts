
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
  
  // 1. Safety & Policy (Blocked content)
  if (msg.includes("blocked") || msg.includes("safety") || msg.includes("policy") || msg.includes("harmful") || msg.includes("finish reason")) {
      return "Content Safety: The AI detected sensitive content (e.g., generated people, restricted symbols). Try using a more abstract logo or a cleaner version without text/faces.";
  }

  // 2. Rate Limiting (429)
  if (msg.includes("429") || msg.includes("rate limit") || msg.includes("quota") || msg.includes("exhausted")) {
      return "High Traffic: The model is receiving too many requests. Please wait 60 seconds before clicking 'Generate' again.";
  }

  // 3. Service Overload (503)
  if (msg.includes("503") || msg.includes("overloaded") || msg.includes("unavailable") || msg.includes("capacity")) {
      return "Server Busy: Google's AI servers are temporarily overloaded. Try again in a few minutes.";
  }

  // 4. Authentication / API Key (401/403)
  if (msg.includes("401") || msg.includes("403") || msg.includes("api key") || msg.includes("unauthorized")) {
      return "Configuration Error: API Key is missing or invalid. Please check your .env file and ensure 'API_KEY' is set correctly.";
  }

  // 5. Bad Request / Invalid Input (400)
  if (msg.includes("400") || msg.includes("invalid") || msg.includes("bad request") || msg.includes("argument")) {
      if (hasBackground) {
          return "Input Conflict: The custom background might be incompatible with the logo. Ensure both are standard PNG/JPG files.";
      }
      return "Format Issue: The logo file format might be corrupted or unsupported. Try converting it to a standard PNG or JPG.";
  }

  // 6. File Size / Payload Too Large (413)
  if (msg.includes("size") || msg.includes("large") || msg.includes("payload") || msg.includes("too big") || msg.includes("413")) {
      return "Size Limit: The uploaded image exceeds the limit. Please resize your logo to under 5MB or downscale to ~1024px.";
  }

  // 7. Resolution / Dimensions (Generic inference)
  if (msg.includes("resolution") || msg.includes("dimension") || msg.includes("pixel")) {
      return "Resolution Warning: Use images between 512x512 and 2048x2048 pixels for best results. Extremely high or low resolutions can fail.";
  }

  // 8. Custom Background Specifics
  if (hasBackground && (msg.includes("shape") || msg.includes("mask") || msg.includes("channel"))) {
      return "Background Mismatch: The custom background scene is causing processing errors. Try removing it to use the default AI studio environment.";
  }

  // Default fallback
  return "General Tip: Ensure your logo is a high-contrast PNG with transparency for the best results. If the issue persists, refresh the page.";
};
