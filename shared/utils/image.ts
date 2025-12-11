
/**
 * Supported export formats for the application.
 */
export type ExportFormat = 'png' | 'jpg' | 'svg';

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
 * Processes and saves an image in the specified format and scale.
 * 
 * @param imageUrl - The source URL (base64 or remote) of the image.
 * @param filename - The desired output filename (without extension).
 * @param format - The export format ('png', 'jpg', 'svg').
 * @param scale - The resolution scale factor (e.g., 1, 2).
 */
export const saveImage = async (
  imageUrl: string,
  filename: string,
  format: ExportFormat,
  scale: number = 1
): Promise<void> => {
  const fullFilename = `${filename}.${format}`;

  try {
    // Handle SVG Export (Vector wrapping)
    if (format === 'svg') {
      const img = new Image();
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.naturalWidth}" height="${img.naturalHeight}">
        <image href="${imageUrl}" width="${img.naturalWidth}" height="${img.naturalHeight}" />
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
    img.crossOrigin = "anonymous"; // Essential for canvas export if image is remote

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

    // Enable high-quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    // Use 0.95 quality for JPEG, ignored for PNG
    const dataUrl = canvas.toDataURL(mimeType, 0.95);
    
    downloadDataUrl(dataUrl, fullFilename);

  } catch (error) {
    console.error("Export failed:", error);
    throw new Error("Failed to process and save image.");
  }
};
