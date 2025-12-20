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
4. AESTHETIC: Follow a ${style} visual direction. Ensure crisp focus and high resolution details.`;
  }

  // Base prompt with enhanced detail for standalone renders
  const enhancedBase = product.defaultPrompt.replace('{style_preference}', style);
  return `${enhancedBase} Focus on extreme physical detail, realistic shadows, and professional product lighting setup. High resolution, photorealistic textures.`;
};

/**
 * Variation Prompts - Specifically designed for alternative lighting and camera perspectives.
 */
export const getVariationPrompts = (
  product: MerchProduct,
  stylePreference: string,
  hasBackground: boolean
): string[] => {
  const base = constructMerchPrompt(product, stylePreference, hasBackground);
  
  return [
    `${base} MOCKUP_ALT_A: Cinematic product shot from a dramatic high-angle bird's eye perspective. Use sharp high-contrast "golden hour" side-lighting to emphasize texture depth.`,
    `${base} MOCKUP_ALT_B: Professional close-up mockup from a sharp 45-degree profile view. Emphasize physical material detail with soft, multi-layered diffused rim lighting.`,
    `${base} MOCKUP_ALT_C: Minimalist composition with a low-angle perspective looking up at the product. Use cool-toned studio lighting with deep shadows and clean reflections.`
  ];
};

/**
 * Robust Error Analysis with deep diagnostic suggestions tailored to Merch Studio.
 */
export const getErrorSuggestion = (errorMsg: string, hasBackground: boolean): string => {
  const msg = errorMsg.toLowerCase();
  
  // Content Safety Filters
  if (msg.includes("safety") || msg.includes("blocked") || msg.includes("candidate")) {
    if (msg.includes("face") || msg.includes("person") || msg.includes("human")) {
      return "Diagnostic: Content safety filter triggered by human elements. Action: The AI model restricts generating human figures in certain contexts. Ensure your logo is a pure graphic and your style prompt doesn't mention models.";
    }
    return "Diagnostic: Policy violation detected in prompt or source assets. Action: Simplify your 'Visual Direction'. Avoid descriptive words that could be flagged as restricted content or extreme realism involving real people.";
  }
  
  // Rate & Throughput
  if (msg.includes("rate") || msg.includes("429")) {
    return "Diagnostic: API throughput limit reached. Action: System is cooling down. Please wait 10-15 seconds before clicking 'Generate' again.";
  }

  // Capacity & Overload
  if (msg.includes("overloaded") || msg.includes("503") || msg.includes("capacity")) {
    return "Diagnostic: Regional server capacity reached. Action: The AI engine is experiencing high load. Switching to an alternate depth; retry your render in 30 seconds.";
  }

  // Configuration & Permissions
  if (msg.includes("billing") || msg.includes("entity") || msg.includes("403") || msg.includes("not found")) {
    return "Diagnostic: Access denied or billing account issue. Action: Verify that your API key is linked to a paid Google Cloud project with active billing for Gemini 2.5/3.0 models.";
  }

  // Asset Integrity & Resolution
  if (msg.includes("dimension") || msg.includes("resolution") || msg.includes("size") || msg.includes("large") || msg.includes("small")) {
    return "Diagnostic: Image resolution mismatch. Action: The logo asset should be between 256px and 3072px. Extremely large files (>5MB) or tiny icons may cause synthesis to fail.";
  }

  if (msg.includes("format") || msg.includes("mime") || msg.includes("type")) {
    return "Diagnostic: Unsupported file container. Action: Convert your asset to a standard PNG or JPG. Transparent PNGs are highly recommended for accurate logo placement.";
  }

  return "Diagnostic: Unknown synthesis pipeline interrupt. Action: Check your network stability and ensure the logo file isn't corrupted. Try a different product category if the issue persists.";
};