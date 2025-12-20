
import { MerchProduct } from './types';

/**
 * Deep Prompt Construction for maximal AI depth and realism.
 */
export const constructMerchPrompt = (
  product: MerchProduct,
  stylePreference: string,
  hasBackground: boolean
): string => {
  const style = stylePreference.trim() || "cinematic hyper-realistic studio";
  
  if (hasBackground) {
    return `IMAGE ANALYSIS & SYNTHESIS TASK:
Image 1 (ID_LOGO): A brand mark or graphic asset.
Image 2 (ID_SCENE): A target environmental setting.

GOAL: Integrate ID_LOGO onto a ${product.name} within ID_SCENE.

TECHNICAL REQUIREMENTS:
1. MATERIAL FIDELITY: Render the ${product.name} using its natural material properties (${product.description}). 
2. LOGO INTEGRATION: Apply ID_LOGO as a high-precision texture. Respect surface curvature, fabric ripples, or material specular highlights. Logo should look printed/embossed, not overlaid.
3. DEPTH & LIGHTING: Analyze ID_SCENE's lighting vectors. Match shadows, ambient occlusion, and color grading exactly. The ${product.name} must appear physically present in the scene.
4. AESTHETIC: Follow a ${style} visual direction. Ensure crisp focus and 8k resolution details.`;
  }

  // Base prompt with enhanced detail for standalone renders
  const enhancedBase = product.defaultPrompt.replace('{style_preference}', style);
  return `${enhancedBase} Focus on extreme physical detail, realistic shadows, and professional product lighting setup. 8k resolution, photorealistic textures.`;
};

/**
 * Variation Matrix Prompts - Truncated to 3 specific variations.
 */
export const getVariationPrompts = (
  product: MerchProduct,
  stylePreference: string,
  hasBackground: boolean
): string[] => {
  const base = constructMerchPrompt(product, stylePreference, hasBackground);
  
  return [
    `${base} VARIATION 1: Alternative dynamic angle. A 45-degree isometric product shot with sharp "golden hour" side-lighting to emphasize surface texture and depth.`,
    `${base} VARIATION 2: High-contrast studio setup. Dramatic "Rembrandt" lighting with deep shadows and strong rim highlights to create a premium, moody aesthetic.`,
    `${base} VARIATION 3: Macro close-up perspective. Focus intensely on the logo integration and material grain, using a shallow depth of field for professional bokeh.`
  ];
};

/**
 * Robust Error Analysis with deep diagnostic suggestions.
 */
export const getErrorSuggestion = (errorMsg: string, hasBackground: boolean): string => {
  const msg = errorMsg.toLowerCase();
  
  if (msg.includes("safety") || msg.includes("blocked")) {
    return "Diagnostic: Prompt depth might have triggered a safety heuristic. Action: Simplify the descriptive language or try a different logo contrast.";
  }
  
  if (msg.includes("rate") || msg.includes("429")) {
    return "Diagnostic: API throughput limit reached. Action: System is auto-retrying with backoff. Please hold for a few seconds.";
  }

  if (msg.includes("overloaded") || msg.includes("503")) {
    return "Diagnostic: Regional server capacity reached. Action: Switching to alternate generation depth. Retry in 10 seconds.";
  }

  if (msg.includes("billing") || msg.includes("entity")) {
    return "Diagnostic: Project configuration error. Action: Ensure you have selected a valid project with an active billing account.";
  }

  return "Diagnostic: Unknown interrupt in the generation pipeline. Action: Verify network stability and asset integrity (PNG/JPG format).";
};
