
/**
 * Supported export formats for the application.
 */
export type ExportFormat = 'png' | 'jpg' | 'svg';

export interface TextOverlayConfig {
  text: string;
  font: string;
  color: string;
  size: number;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  align?: 'left' | 'center' | 'right';
}

/**
 * Downloads a data URL as a file.
 */
const downloadDataUrl = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Removes the Data URL prefix to get raw Base64 string.
 */
export const cleanBase64 = (b64: string): string => {
  return b64.replace(/^data:image\/(png|jpeg|jpg|webp|heic);base64,/, "");
};

/**
 * Robustly detects mime type from base64 header.
 */
export const getMimeType = (b64: string): string => {
  const match = b64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  return match ? match[1] : 'image/png';
};

/**
 * Processes and saves an image in the specified format and scale.
 * Optionally burns text overlay onto the image.
 */
export const saveImage = async (
  imageUrl: string,
  filename: string,
  format: ExportFormat,
  scale: number = 1,
  overlay?: TextOverlayConfig
): Promise<void> => {
  const fullFilename = `${filename}.${format}`;

  try {
    // Handle SVG Export (Vector wrapping) - Overlay not fully supported in simple wrapper yet
    if (format === 'svg') {
      const img = new Image();
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Basic SVG text construction
      let textElement = '';
      if (overlay && overlay.text) {
         // Default to middle anchor for SVG simple export if align missing
         const anchor = overlay.align === 'left' ? 'start' : overlay.align === 'right' ? 'end' : 'middle';
         textElement = `<text x="${overlay.x}%" y="${overlay.y}%" fill="${overlay.color}" font-family="${overlay.font}" font-size="${overlay.size}px" text-anchor="${anchor}" dominant-baseline="middle">${overlay.text}</text>`;
      }

      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.naturalWidth}" height="${img.naturalHeight}">
        <image href="${imageUrl}" width="${img.naturalWidth}" height="${img.naturalHeight}" />
        ${textElement}
      </svg>`;

      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      downloadDataUrl(url, fullFilename);
      URL.revokeObjectURL(url);
      return;
    }

    // Handle Raster Export (PNG/JPG)
    const img = new Image();
    img.src = imageUrl;
    img.crossOrigin = "anonymous"; 

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    const width = img.naturalWidth * scale;
    const height = img.naturalHeight * scale;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get canvas context");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    // Apply Text Overlay
    if (overlay && overlay.text) {
      // Scale font size relative to original image if scale != 1
      const scaledFontSize = overlay.size * scale;
      ctx.font = `${scaledFontSize}px ${overlay.font}`;
      ctx.fillStyle = overlay.color;
      
      // Handle alignment
      ctx.textAlign = overlay.align || 'center';
      ctx.textBaseline = 'middle';
      
      // Calculate position based on percentage
      const x = (overlay.x / 100) * width;
      const y = (overlay.y / 100) * height;
      
      ctx.fillText(overlay.text, x, y);
    }

    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mimeType, 0.95);
    
    downloadDataUrl(dataUrl, fullFilename);

  } catch (error) {
    console.error("Export failed:", error);
    throw new Error("Failed to process and save image.");
  }
};
