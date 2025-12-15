
import { useState, useCallback, useRef, useEffect } from 'react';
import { generateOrEditImage } from '../../services/gemini';
import { AppError } from '../utils/errors';

interface UseGenAIResult {
  loading: boolean;
  error: string | null;
  resultImage: string | null;
  generate: (imageBase64: string, prompt: string, additionalImages?: string[]) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

export const useGenAI = (): UseGenAIResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  // Ref to track the active request controller
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearError = useCallback(() => setError(null), []);
  
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setError(null);
    setResultImage(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const generate = useCallback(async (
    imageBase64: string, 
    prompt: string, 
    additionalImages: string[] = []
  ): Promise<boolean> => {
    if (!imageBase64 || !prompt) return false;

    // Abort any existing request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const result = await generateOrEditImage(imageBase64, prompt, additionalImages, { 
        signal: controller.signal 
      });
      
      // Check if aborted during await
      if (controller.signal.aborted) return false;

      setResultImage(result);
      return true;

    } catch (err: unknown) {
      if (controller.signal.aborted) return false;
      
      // Silent catch for specific abort errors if they slip through
      if (err instanceof Error && (err.name === 'AbortError' || err.message === 'Request aborted')) {
        return false;
      }

      console.error("GenAI Hook Error:", err);
      
      let errorMessage = "An unexpected error occurred.";
      if (err instanceof AppError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return false;

    } finally {
      // Only update loading state if this is still the active request
      if (abortControllerRef.current === controller) {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  }, []);

  return { loading, error, resultImage, generate, clearError, reset };
};
