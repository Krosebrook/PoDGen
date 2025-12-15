
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
  rotation?: number;
  opacity?: number;
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

export const cleanBase64 = (b64: string): string => {
  return b64.replace(/^data:image\/(png|jpeg|jpg|webp|heic);base64,/, "");
};

export const getMimeType = (b64: string): string => {
  const match = b64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  return match ? match[1] : 'image/png';
};

/**
 * Helper class to handle complex canvas text rendering
 */
class CanvasTextRenderer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private config: TextOverlayConfig,
    private width: number,
    private height: number,
    private scale: number
  ) {}

  public render() {
    if (!this.config.text) return;

    this.ctx.save();
    
    // 1. Configure Font
    const scaledFontSize = this.config.size * this.scale;
    const lineHeight = scaledFontSize * 1.2;
    this.ctx.font = `${scaledFontSize}px ${this.config.font}`;
    this.ctx.fillStyle = this.config.color;
    
    // 2. Calculate Anchor Position
    const x = (this.config.x / 100) * this.width;
    const y = (this.config.y / 100) * this.height;

    // 3. Transformation (Translate & Rotate)
    this.ctx.translate(x, y);
    if (this.config.rotation) {
      this.ctx.rotate((this.config.rotation * Math.PI) / 180);
    }
    if (this.config.opacity !== undefined) {
      this.ctx.globalAlpha = this.config.opacity / 100;
    }

    // 4. Alignment settings
    this.ctx.textAlign = this.config.align || 'center';
    this.ctx.textBaseline = 'middle'; 

    // 5. Multiline Rendering
    const lines = this.config.text.split('\n');
    const totalBlockHeight = lines.length * lineHeight;
    const startY = -(totalBlockHeight / 2) + (lineHeight / 2);

    lines.forEach((line, i) => {
      // Offset from the centered block start
      const lineOffset = i * lineHeight;
      this.ctx.fillText(line, 0, startY + lineOffset);
    });

    this.ctx.restore();
  }
}

/**
 * Strategy for Raster Export (PNG/JPG)
 */
const exportToRaster = async (
  img: HTMLImageElement, 
  filename: string, 
  format: 'png' | 'jpg', 
  scale: number, 
  overlay?: TextOverlayConfig
) => {
  const canvas = document.createElement('canvas');
  const width = img.naturalWidth * scale;
  const height = img.naturalHeight * scale;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not get canvas context");

  // High quality settings
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  if (overlay) {
    new CanvasTextRenderer(ctx, overlay, width, height, scale).render();
  }

  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const dataUrl = canvas.toDataURL(mimeType, 0.95); // 0.95 quality for JPG
  downloadDataUrl(dataUrl, `${filename}.${format}`);
};

/**
 * Strategy for SVG Export
 */
const exportToSvg = (
  img: HTMLImageElement,
  filename: string,
  overlay?: TextOverlayConfig
) => {
  // SVG Text Construction
  let textElement = '';
  if (overlay && overlay.text) {
    const anchor = overlay.align === 'left' ? 'start' : overlay.align === 'right' ? 'end' : 'middle';
    const lines = overlay.text.split('\n');
    const lineHeight = overlay.size * 1.2;
    
    // Calculate vertical centering logic for SVG tspan
    // dy logic: first line is offset, subsequent lines are relative
    const totalHeight = lines.length * lineHeight;
    // We start drawing from the vertical center (y), so we move up by half total height
    const startYOffset = -(totalHeight / 2) + (lineHeight / 2); // approximate baseline adjustment

    const tspans = lines.map((line, i) => 
      `<tspan x="${overlay.x}%" dy="${i === 0 ? startYOffset : lineHeight}px">${line}</tspan>`
    ).join('');

    textElement = `<text 
      x="${overlay.x}%" 
      y="${overlay.y}%" 
      fill="${overlay.color}" 
      font-family="${overlay.font}" 
      font-size="${overlay.size}px" 
      text-anchor="${anchor}" 
      dominant-baseline="middle" 
      opacity="${(overlay.opacity || 100) / 100}" 
      transform="rotate(${overlay.rotation || 0}, ${overlay.x}%, ${overlay.y}%)"
    >${tspans}</text>`;
  }

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.naturalWidth}" height="${img.naturalHeight}">
    <image href="${img.src}" width="${img.naturalWidth}" height="${img.naturalHeight}" />
    ${textElement}
  </svg>`;

  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, `${filename}.svg`);
  URL.revokeObjectURL(url);
};

/**
 * Main Export Entry Point
 */
export const saveImage = async (
  imageUrl: string,
  filename: string,
  format: ExportFormat,
  scale: number = 1,
  overlay?: TextOverlayConfig
): Promise<void> => {
  try {
    const img = new Image();
    img.src = imageUrl;
    img.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image source"));
    });

    if (format === 'svg') {
      exportToSvg(img, filename, overlay);
    } else {
      await exportToRaster(img, filename, format, scale, overlay);
    }
  } catch (error) {
    console.error("Export failed:", error);
    throw new Error("Failed to process and save image.");
  }
};
