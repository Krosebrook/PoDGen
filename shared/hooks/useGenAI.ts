
import { useState, useCallback } from 'react';
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

  const clearError = useCallback(() => setError(null), []);
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResultImage(null);
  }, []);

  const generate = useCallback(async (
    imageBase64: string, 
    prompt: string, 
    additionalImages: string[] = []
  ): Promise<boolean> => {
    if (!imageBase64 || !prompt) return false;

    setLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const result = await generateOrEditImage(imageBase64, prompt, additionalImages);
      setResultImage(result);
      return true;
    } catch (err: any) {
      console.error("GenAI Hook caught error:", err);
      
      let msg = "An unexpected error occurred.";
      if (err instanceof AppError) {
        msg = err.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }

      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, resultImage, generate, clearError, reset };
};
