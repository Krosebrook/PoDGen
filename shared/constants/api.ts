/**
 * API Configuration Constants
 * 
 * These constants define API-related configurations including timeouts,
 * retry policies, and request limits.
 */

/** Default number of retry attempts for transient API failures */
export const DEFAULT_RETRY_COUNT = 2;

/** Base delay for exponential backoff in milliseconds */
export const RETRY_BASE_DELAY_MS = 1000;

/** Maximum random jitter to add to retry delays in milliseconds */
export const RETRY_MAX_JITTER_MS = 500;

/** Request timeout in milliseconds (30 seconds) */
export const REQUEST_TIMEOUT_MS = 30000;

/** Default thinking budget for AI reasoning tasks (32K tokens) */
export const DEFAULT_THINKING_BUDGET = 32000;

/** Default maximum output tokens for AI responses */
export const DEFAULT_MAX_OUTPUT_TOKENS = 2048;
