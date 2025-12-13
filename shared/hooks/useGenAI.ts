
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
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearError = useCallback(() => setError(null), []);
  
  const reset = useCallback(() => {
    // Abort any ongoing request
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

    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const result = await generateOrEditImage(imageBase64, prompt, additionalImages, { 
        signal: controller.signal 
      });
      
      if (!controller.signal.aborted) {
        setResultImage(result);
        return true;
      }
      return false;
    } catch (err: unknown) {
      // Ignore abort errors
      if (err instanceof Error && (err.name === 'AbortError' || err.message === 'Request aborted')) {
        return false;
      }

      console.error("GenAI Hook caught error:", err);
      
      let msg = "An unexpected error occurred.";
      if (err instanceof AppError) {
        msg = err.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }

      if (!controller.signal.aborted) {
        setError(msg);
      }
      return false;
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  }, []);

  return { loading, error, resultImage, generate, clearError, reset };
};
