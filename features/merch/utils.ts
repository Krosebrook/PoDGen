
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
  
  if (msg.includes("blocked") || msg.includes("safety") || msg.includes("policy")) {
      return "The AI flagged the content as unsafe. Try a logo with less sensitive visuals.";
  }
  if (msg.includes("429") || msg.includes("rate limit") || msg.includes("quota")) {
      return "System is busy (Rate Limited). Please wait 30 seconds before retrying.";
  }
  if (msg.includes("400") || msg.includes("invalid") || msg.includes("bad request")) {
      return "The image format might be unsupported. Try converting your logo to PNG or JPG.";
  }
  if (hasBackground && (msg.includes("shape") || msg.includes("dimension") || msg.includes("compatibility"))) {
      return "The custom background might be causing issues. Try removing it to use the default studio background.";
  }
  if (msg.includes("size") || msg.includes("large") || msg.includes("payload")) {
      return "The uploaded image is too large. Please use an image under 5MB.";
  }
  return "Ensure your logo is high-contrast and clear. If using a custom background, ensure it's a standard image format.";
};
