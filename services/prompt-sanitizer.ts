/**
 * Prompt Sanitization and Security
 * 
 * Provides utilities to sanitize and validate AI prompts to prevent:
 * - Prompt injection attacks
 * - Malicious instructions
 * - Excessive token usage
 * - OWASP security violations
 */

import { ValidationError } from '../shared/utils/errors';
import { logger } from '../shared/utils/logger';

interface SanitizationResult {
  sanitized: string;
  violations: string[];
  safe: boolean;
}

export class PromptSanitizer {
  private static instance: PromptSanitizer;

  // Maximum prompt length (characters)
  private readonly MAX_PROMPT_LENGTH = 10000;
  
  // Patterns that indicate potential prompt injection
  private readonly SUSPICIOUS_PATTERNS = [
    /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
    /disregard\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?)/gi,
    /forget\s+(everything|all|instructions?)/gi,
    /system:\s*you\s+are\s+now/gi,
    /new\s+instructions?:\s*/gi,
    /override\s+(system|instructions?|rules?)/gi,
    /act\s+as\s+(if\s+)?you('re|\s+are)\s+(a\s+)?(different|new)/gi,
    /pretend\s+(that\s+)?you('re|\s+are)/gi,
    /<\s*script[\s>]/gi,  // Script tags
    /javascript:/gi,       // JavaScript protocol
    /data:text\/html/gi,   // Data URIs
    /on(load|error|click|mouse)/gi,  // Event handlers
  ];

  // Patterns for excessive special characters (potential encoding attacks)
  private readonly EXCESSIVE_SPECIAL_CHARS = /[^\w\s.,!?;:()\-'"]{10,}/g;

  // SQL-like injection patterns
  private readonly SQL_PATTERNS = [
    /'\s*(OR|AND)\s*'?\d*'?\s*=\s*'?\d*'?/gi,
    /UNION\s+SELECT/gi,
    /DROP\s+TABLE/gi,
    /DELETE\s+FROM/gi,
  ];

  private constructor() {}

  public static getInstance(): PromptSanitizer {
    if (!PromptSanitizer.instance) {
      PromptSanitizer.instance = new PromptSanitizer();
    }
    return PromptSanitizer.instance;
  }

  /**
   * Sanitize and validate a prompt
   */
  public sanitize(prompt: string): SanitizationResult {
    const violations: string[] = [];
    let sanitized = prompt;

    // Check length
    if (prompt.length > this.MAX_PROMPT_LENGTH) {
      violations.push(`Prompt exceeds maximum length (${this.MAX_PROMPT_LENGTH} characters)`);
      sanitized = sanitized.substring(0, this.MAX_PROMPT_LENGTH);
    }

    // Check for suspicious patterns
    for (const pattern of this.SUSPICIOUS_PATTERNS) {
      if (pattern.test(sanitized)) {
        violations.push(`Suspicious pattern detected: ${pattern.source}`);
      }
    }

    // Check for SQL injection patterns
    for (const pattern of this.SQL_PATTERNS) {
      if (pattern.test(sanitized)) {
        violations.push(`SQL injection pattern detected: ${pattern.source}`);
      }
    }

    // Check for excessive special characters
    if (this.EXCESSIVE_SPECIAL_CHARS.test(sanitized)) {
      violations.push('Excessive special characters detected');
      sanitized = sanitized.replace(this.EXCESSIVE_SPECIAL_CHARS, '...');
    }

    // Remove null bytes
    if (sanitized.includes('\0')) {
      violations.push('Null bytes detected and removed');
      sanitized = sanitized.replace(/\0/g, '');
    }

    // Trim whitespace
    sanitized = sanitized.trim();

    // Log violations
    if (violations.length > 0) {
      logger.warn(`Prompt sanitization violations: ${violations.join(', ')}`);
    }

    const safe = violations.length === 0;

    return { sanitized, violations, safe };
  }

  /**
   * Validate a prompt and throw if unsafe
   */
  public validate(prompt: string): string {
    const result = this.sanitize(prompt);
    
    if (!result.safe) {
      throw new ValidationError(
        'Prompt contains potentially unsafe content',
        { violations: result.violations }
      );
    }

    return result.sanitized;
  }

  /**
   * Clean HTML/XML tags from prompt
   */
  public stripHtml(prompt: string): string {
    return prompt.replace(/<[^>]*>/g, '');
  }

  /**
   * Escape special characters
   */
  public escape(prompt: string): string {
    return prompt
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Truncate prompt to a specific token budget (approximate)
   */
  public truncateToTokens(prompt: string, maxTokens: number): string {
    // Rough approximation: 1 token ≈ 4 characters
    const maxChars = maxTokens * 4;
    
    if (prompt.length <= maxChars) {
      return prompt;
    }

    // Truncate at word boundary
    let truncated = prompt.substring(0, maxChars);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxChars * 0.8) {
      truncated = truncated.substring(0, lastSpace);
    }

    return truncated + '...';
  }

  /**
   * Validate file upload (for image inputs)
   */
  public validateImageInput(base64: string): boolean {
    // Check if it's a valid base64 image
    const imagePattern = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/i;
    
    if (!imagePattern.test(base64)) {
      logger.warn('Invalid image format detected');
      return false;
    }

    // Check for embedded scripts in base64 (very rare but possible)
    const decoded = base64.substring(base64.indexOf(',') + 1);
    if (decoded.includes('<script') || decoded.includes('javascript:')) {
      logger.warn('Suspicious content in image data');
      return false;
    }

    return true;
  }

  /**
   * Rate limit check (basic implementation)
   */
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  
  public checkRateLimit(userId: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userLimit = this.requestCounts.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      this.requestCounts.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (userLimit.count >= maxRequests) {
      logger.warn(`Rate limit exceeded for user: ${userId}`);
      return false;
    }

    userLimit.count++;
    return true;
  }

  /**
   * Clean up old rate limit entries
   */
  public cleanupRateLimits(): void {
    const now = Date.now();
    for (const [userId, limit] of this.requestCounts.entries()) {
      if (now > limit.resetTime) {
        this.requestCounts.delete(userId);
      }
    }
  }
}

export const promptSanitizer = PromptSanitizer.getInstance();
