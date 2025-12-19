
export const cleanBase64 = (b64: string): string => {
  return b64.replace(/^data:image\/(png|jpeg|jpg|webp|heic);base64,/, "");
};

export const getMimeType = (b64: string): string => {
  const match = b64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  return match ? match[1] : 'image/png';
};

// Define and export ExportFormat type
export type ExportFormat = 'png' | 'jpg' | 'svg';

export interface TextOverlayConfig {
  text: string;
  font: string;
  color: string;
  size: number;
  x: number;
  y: number;
  align?: 'left' | 'center' | 'right';
  rotation?: number;
  opacity?: number;
  bgEnabled?: boolean;
  bgColor?: string;
  bgPadding?: number;
  bgOpacity?: number;
  bgRounding?: number;
}

/**
 * High-precision canvas rendering for brand mockups.
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
      img.onerror = () => reject(new Error("Resource load failure"));
    });

    const canvas = document.createElement('canvas');
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d', { alpha: format === 'png' });
    if (!ctx) throw new Error("Canvas context init failed");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);

    if (overlay && overlay.text) {
      ctx.save();
      const fontSize = overlay.size * scale;
      ctx.font = `${fontSize}px ${overlay.font}`;
      const textAlign = overlay.align || 'center';
      ctx.textAlign = textAlign;
      ctx.textBaseline = 'middle';

      const xPos = (overlay.x / 100) * w;
      const yPos = (overlay.y / 100) * h;

      ctx.translate(xPos, yPos);
      if (overlay.rotation) ctx.rotate((overlay.rotation * Math.PI) / 180);
      
      const lines = overlay.text.split('\n');
      const lineHeight = fontSize * 1.2;
      const totalHeight = lines.length * lineHeight;

      // Draw background if enabled
      if (overlay.bgEnabled) {
        ctx.save();
        const padding = (overlay.bgPadding ?? 16) * scale;
        const rounding = (overlay.bgRounding ?? 8) * scale;
        const bgOpacity = (overlay.bgOpacity ?? 50) / 100;
        
        // Measure the widest line
        let maxLineWidth = 0;
        lines.forEach(line => {
          maxLineWidth = Math.max(maxLineWidth, ctx.measureText(line).width);
        });

        const bgWidth = maxLineWidth + (padding * 2);
        const bgHeight = totalHeight + (padding * 2);
        
        // Calculate offset based on alignment
        let bgX = -bgWidth / 2;
        if (textAlign === 'left') bgX = -padding;
        if (textAlign === 'right') bgX = -bgWidth + padding;
        const bgY = -bgHeight / 2;

        const hex = overlay.bgColor || '#000000';
        let r = 0, g = 0, b = 0;
        if (hex.length === 7) {
          r = parseInt(hex.slice(1, 3), 16);
          g = parseInt(hex.slice(3, 5), 16);
          b = parseInt(hex.slice(5, 7), 16);
        }

        ctx.globalAlpha = bgOpacity;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        
        // Draw rounded rectangle
        ctx.beginPath();
        ctx.moveTo(bgX + rounding, bgY);
        ctx.lineTo(bgX + bgWidth - rounding, bgY);
        ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + rounding);
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight - rounding);
        ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - rounding, bgY + bgHeight);
        ctx.lineTo(bgX + rounding, bgY + bgHeight);
        ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - rounding);
        ctx.lineTo(bgX, bgY + rounding);
        ctx.quadraticCurveTo(bgX, bgY, bgX + rounding, bgY);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        // Shadow only if no background
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 20 * scale;
        ctx.shadowOffsetY = 4 * scale;
      }

      ctx.fillStyle = overlay.color;
      ctx.globalAlpha = (overlay.opacity ?? 100) / 100;
      
      lines.forEach((line, i) => {
        ctx.fillText(line, 0, (i - (lines.length - 1) / 2) * lineHeight);
      });
      ctx.restore();
    }

    const downloadLink = document.createElement('a');
    downloadLink.download = `${filename}.${format}`;
    downloadLink.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : format}`, 0.9);
    downloadLink.click();
  } catch (error) {
    console.error("Image export engine error:", error);
  }
};
