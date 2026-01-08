/**
 * Performance Optimization Utilities
 * 
 * Provides utilities for optimizing React component performance:
 * - Debouncing and throttling
 * - Intersection Observer hooks
 * - Idle callback scheduling
 */

/**
 * Debounce function calls to prevent excessive executions
 * 
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle function calls to limit execution frequency
 * 
 * @param func - Function to throttle
 * @param limit - Minimum time between executions in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let inThrottle: boolean = false;
  let lastResult: ReturnType<T> | undefined;

  return function throttled(...args: Parameters<T>): ReturnType<T> | undefined {
    if (!inThrottle) {
      lastResult = func(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }

    return lastResult;
  };
}

/**
 * Execute a function when the browser is idle
 * Falls back to setTimeout if requestIdleCallback is not available
 * 
 * @param callback - Function to execute during idle time
 * @param options - Optional timeout in milliseconds
 * @returns Handle that can be used with cancelIdle
 */
export function runWhenIdle(
  callback: () => void,
  options?: { timeout?: number }
): number {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    return setTimeout(callback, options?.timeout || 1) as unknown as number;
  }
}

/**
 * Cancel a previously scheduled idle callback
 * 
 * @param handle - Handle returned by runWhenIdle
 */
export function cancelIdle(handle: number): void {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(handle);
  } else {
    clearTimeout(handle);
  }
}

/**
 * Batch multiple state updates into a single render cycle
 * 
 * @param callback - Function containing state updates
 */
export function batchUpdates(callback: () => void): void {
  // React 18+ batches updates automatically, but we can use this
  // for explicit batching or as a placeholder for future optimizations
  callback();
}

/**
 * Memoize expensive function calls
 * 
 * @param fn - Function to memoize
 * @returns Memoized function with cache
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Create a cancelable promise
 * 
 * @param promise - Promise to make cancelable
 * @returns Object with promise and cancel function
 */
export function makeCancelable<T>(promise: Promise<T>): {
  promise: Promise<T>;
  cancel: () => void;
} {
  let isCanceled = false;

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise
      .then((value) => {
        if (!isCanceled) {
          resolve(value);
        }
      })
      .catch((error) => {
        if (!isCanceled) {
          reject(error);
        }
      });
  });

  return {
    promise: wrappedPromise,
    cancel: () => {
      isCanceled = true;
    },
  };
}

/**
 * Measure performance of a function
 * 
 * @param label - Label for the measurement
 * @param fn - Function to measure
 * @returns Result of the function
 */
export async function measurePerformance<T>(
  label: string,
  fn: () => T | Promise<T>
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await fn();
    const end = performance.now();
    const duration = end - start;
    
    console.debug(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    
    return result;
  } catch (error) {
    const end = performance.now();
    const duration = end - start;
    
    console.error(`[Performance] ${label} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}

/**
 * Preload an image to prevent loading delays
 * 
 * @param src - Image source URL
 * @returns Promise that resolves when image is loaded
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Chunk an array into smaller arrays for batch processing
 * 
 * @param array - Array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunks
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  
  return chunks;
}

/**
 * Process items in batches with a delay between batches
 * 
 * @param items - Items to process
 * @param processor - Function to process each item
 * @param batchSize - Number of items per batch
 * @param delay - Delay between batches in milliseconds
 */
export async function processBatches<T>(
  items: T[],
  processor: (item: T, index: number) => Promise<void> | void,
  batchSize: number = 10,
  delay: number = 0
): Promise<void> {
  const batches = chunk(items, batchSize);
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    
    await Promise.all(
      batch.map((item, idx) => processor(item, i * batchSize + idx))
    );
    
    if (delay > 0 && i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
