
export const cleanBase64 = (b64: string): string => {
  return b64.replace(/^data:image\/(png|jpeg|jpg|webp|heic);base64,/, "");
};

export const getMimeType = (b64: string): string => {
  const match = b64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  return match ? match[1] : 'image/png';
};

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
 * High-precision canvas rendering with edge-case protection for memory and coordinate bounds.
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
      img.onerror = () => reject(new Error("TEXTURE_LOAD_FAILURE: Resource unreachable."));
    });

    const canvas = document.createElement('canvas');
    // EDGE CASE: Max Canvas Size limits (prevent browser crash on extreme scale)
    const maxDimension = 8192;
    const w = Math.min(img.naturalWidth * scale, maxDimension);
    const h = Math.min(img.naturalHeight * scale, maxDimension);
    
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d', { alpha: format === 'png', desynchronized: true });
    if (!ctx) throw new Error("CANVAS_CONTEXT_FAILURE: Failed to acquire 2D context.");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);

    if (overlay && overlay.text.trim()) {
      ctx.save();
      const fontSize = (overlay.size * scale) * (w / img.naturalWidth);
      ctx.font = `bold ${fontSize}px ${overlay.font}`;
      const textAlign = overlay.align || 'center';
      ctx.textAlign = textAlign;
      ctx.textBaseline = 'middle';

      // Clamp coordinates to bounds
      const xPos = Math.max(0, Math.min(100, overlay.x)) / 100 * w;
      const yPos = Math.max(0, Math.min(100, overlay.y)) / 100 * h;

      ctx.translate(xPos, yPos);
      if (overlay.rotation) ctx.rotate((overlay.rotation * Math.PI) / 180);
      
      const lines = overlay.text.split('\n');
      const lineHeight = fontSize * 1.2;
      const totalHeight = lines.length * lineHeight;

      if (overlay.bgEnabled) {
        ctx.save();
        const padding = (overlay.bgPadding ?? 16) * scale;
        const rounding = (overlay.bgRounding ?? 8) * scale;
        const bgOpacity = (overlay.bgOpacity ?? 50) / 100;
        
        let maxLineWidth = 0;
        lines.forEach(line => {
          maxLineWidth = Math.max(maxLineWidth, ctx.measureText(line).width);
        });

        const bgWidth = maxLineWidth + (padding * 2);
        const bgHeight = totalHeight + (padding * 2);
        
        let bgX = -bgWidth / 2;
        if (textAlign === 'left') bgX = -padding;
        if (textAlign === 'right') bgX = -bgWidth + padding;
        const bgY = -bgHeight / 2;

        const hex = overlay.bgColor || '#000000';
        ctx.globalAlpha = bgOpacity;
        ctx.fillStyle = hex;
        
        // Rounded Rect Path
        ctx.beginPath();
        ctx.roundRect(bgX, bgY, bgWidth, bgHeight, rounding);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 10 * scale;
        ctx.shadowOffsetY = 2 * scale;
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
    downloadLink.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : format}`, 0.95);
    downloadLink.click();
    
    // Cleanup
    canvas.width = 0;
    canvas.height = 0;
  } catch (error) {
    console.error("EXPORT_ENGINE_CRITICAL:", error);
  }
};
