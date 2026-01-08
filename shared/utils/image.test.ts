import { describe, it, expect } from 'vitest';
import { cleanBase64, getMimeType } from './image';

describe('Image Utilities', () => {
  describe('cleanBase64', () => {
    it('should remove data URL prefix from PNG base64', () => {
      const base64WithPrefix = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg';
      const result = cleanBase64(base64WithPrefix);
      
      expect(result).toBe('iVBORw0KGgoAAAANSUhEUg');
      expect(result).not.toContain('data:');
      expect(result).not.toContain('base64,');
    });

    it('should remove data URL prefix from JPEG base64', () => {
      const base64WithPrefix = 'data:image/jpeg;base64,/9j/4AAQSkZJRg';
      const result = cleanBase64(base64WithPrefix);
      
      expect(result).toBe('/9j/4AAQSkZJRg');
    });

    it('should remove data URL prefix from JPG base64', () => {
      const base64WithPrefix = 'data:image/jpg;base64,/9j/4AAQSkZJRg';
      const result = cleanBase64(base64WithPrefix);
      
      expect(result).toBe('/9j/4AAQSkZJRg');
    });

    it('should remove data URL prefix from WebP base64', () => {
      const base64WithPrefix = 'data:image/webp;base64,UklGRiQAAABXRUJQ';
      const result = cleanBase64(base64WithPrefix);
      
      expect(result).toBe('UklGRiQAAABXRUJQ');
    });

    it('should remove data URL prefix from HEIC base64', () => {
      const base64WithPrefix = 'data:image/heic;base64,ZnR5cGhlaWM';
      const result = cleanBase64(base64WithPrefix);
      
      expect(result).toBe('ZnR5cGhlaWM');
    });

    it('should return unchanged string if no prefix present', () => {
      const plainBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB';
      const result = cleanBase64(plainBase64);
      
      expect(result).toBe(plainBase64);
    });

    it('should handle empty string', () => {
      const result = cleanBase64('');
      
      expect(result).toBe('');
    });

    it('should only remove the prefix once', () => {
      const base64 = 'data:image/png;base64,data:image/png;base64,actualdata';
      const result = cleanBase64(base64);
      
      // Should only remove first occurrence
      expect(result).toBe('data:image/png;base64,actualdata');
    });
  });

  describe('getMimeType', () => {
    it('should extract MIME type from PNG data URL', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg';
      const result = getMimeType(dataUrl);
      
      expect(result).toBe('image/png');
    });

    it('should extract MIME type from JPEG data URL', () => {
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg';
      const result = getMimeType(dataUrl);
      
      expect(result).toBe('image/jpeg');
    });

    it('should extract MIME type from WebP data URL', () => {
      const dataUrl = 'data:image/webp;base64,UklGRiQAAABXRUJQ';
      const result = getMimeType(dataUrl);
      
      expect(result).toBe('image/webp');
    });

    it('should extract MIME type with plus sign (SVG+XML)', () => {
      const dataUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmci';
      const result = getMimeType(dataUrl);
      
      expect(result).toBe('image/svg+xml');
    });

    it('should default to image/png if no MIME type found', () => {
      const plainBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB';
      const result = getMimeType(plainBase64);
      
      expect(result).toBe('image/png');
    });

    it('should default to image/png for malformed data URL', () => {
      const malformed = 'data:text/plain;base64,SGVsbG8gV29ybGQ=';
      const result = getMimeType(malformed);
      
      expect(result).toBe('image/png');
    });

    it('should default to image/png for empty string', () => {
      const result = getMimeType('');
      
      expect(result).toBe('image/png');
    });

    it('should handle case-insensitive MIME types', () => {
      const dataUrl = 'data:IMAGE/PNG;base64,iVBORw0KGgoAAAANSUhEUg';
      const result = getMimeType(dataUrl);
      
      // The regex is case-insensitive, so it should capture uppercase
      expect(result).toMatch(/image\/png/i);
    });

    it('should handle HEIC format', () => {
      const dataUrl = 'data:image/heic;base64,ZnR5cGhlaWM';
      const result = getMimeType(dataUrl);
      
      expect(result).toBe('image/heic');
    });

    it('should handle GIF format', () => {
      const dataUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAP';
      const result = getMimeType(dataUrl);
      
      expect(result).toBe('image/gif');
    });
  });

  describe('cleanBase64 and getMimeType integration', () => {
    it('should work together to process data URL', () => {
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD';
      
      const mimeType = getMimeType(dataUrl);
      const cleanedBase64 = cleanBase64(dataUrl);
      
      expect(mimeType).toBe('image/jpeg');
      expect(cleanedBase64).toBe('/9j/4AAQSkZJRgABAQAAAQABAAD');
      expect(cleanedBase64).not.toContain('data:');
    });

    it('should handle already cleaned base64 safely', () => {
      const cleanedBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB';
      
      const mimeType = getMimeType(cleanedBase64);
      const reCleaned = cleanBase64(cleanedBase64);
      
      expect(mimeType).toBe('image/png'); // Default fallback
      expect(reCleaned).toBe(cleanedBase64); // No change
    });
  });
});
