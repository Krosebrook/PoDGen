import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';

/**
 * Test Utilities and Helpers
 * 
 * Common utilities for testing React components and application logic.
 */

/**
 * Custom render function that wraps components with common providers
 * Currently no providers needed, but this pattern allows easy addition of:
 * - Context providers
 * - Router providers
 * - Theme providers
 * - Redux/state providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add custom options here as needed
}

function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  // If we need providers in the future, add them here as a wrapper
  const Wrapper = ({ children }: { children: ReactNode }) => {
    return <>{children}</>;
  };

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Wait for a condition to be true
 * Useful for testing async operations
 */
export async function waitFor(
  callback: () => boolean | Promise<boolean>,
  timeout = 3000,
  interval = 50
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const result = await callback();
    if (result) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Create a mock file for file upload testing
 */
export function createMockFile(
  name: string,
  content: string,
  mimeType: string
): File {
  const blob = new Blob([content], { type: mimeType });
  return new File([blob], name, { type: mimeType });
}

/**
 * Create a mock image file with base64 data
 */
export function createMockImageFile(
  name: string = 'test-image.png',
  width: number = 100,
  height: number = 100
): File {
  // Minimal 1x1 PNG as base64
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([array], { type: 'image/png' });
  return new File([blob], name, { type: 'image/png' });
}

/**
 * Suppress console errors/warnings during tests
 * Useful when testing error boundaries or expected errors
 */
export function suppressConsole(
  methods: ('error' | 'warn' | 'log')[] = ['error', 'warn']
): () => void {
  const original: { [key: string]: any } = {};
  
  methods.forEach(method => {
    original[method] = console[method];
    console[method] = () => {};
  });
  
  // Return cleanup function
  return () => {
    methods.forEach(method => {
      console[method] = original[method];
    });
  };
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };
