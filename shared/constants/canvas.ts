/**
 * Canvas and Image Export Configuration Constants
 * 
 * These constants define limits and defaults for canvas rendering
 * and image export operations.
 */

/** Maximum canvas dimension in pixels to prevent memory overflow */
export const MAX_CANVAS_DIMENSION = 8192;

/** Default export scale multiplier for high-resolution exports */
export const DEFAULT_EXPORT_SCALE = 2;

/** Default export quality for lossy formats (0-1 scale) */
export const DEFAULT_EXPORT_QUALITY = 0.95;

/** Image smoothing quality setting */
export const IMAGE_SMOOTHING_QUALITY = 'high' as const;

/** Text overlay default font size in pixels */
export const DEFAULT_TEXT_SIZE = 48;

/** Text overlay default line height multiplier */
export const TEXT_LINE_HEIGHT_MULTIPLIER = 1.2;

/** Default text shadow blur radius in pixels */
export const TEXT_SHADOW_BLUR = 10;

/** Default text shadow offset Y in pixels */
export const TEXT_SHADOW_OFFSET_Y = 2;

/** Default text background padding in pixels */
export const DEFAULT_TEXT_BG_PADDING = 16;

/** Default text background border radius in pixels */
export const DEFAULT_TEXT_BG_ROUNDING = 8;

/** Default text background opacity (0-100) */
export const DEFAULT_TEXT_BG_OPACITY = 50;

/** Default text opacity (0-100) */
export const DEFAULT_TEXT_OPACITY = 100;
