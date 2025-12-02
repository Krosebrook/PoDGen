
import { useState, useCallback } from 'react';
import { generateOrEditImage } from '../services/gemini';
import { AppError } from '../shared/utils/errors';

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
      
      // Since the service now guarantees AppError types, we can safely use the message
      // or fall back to a generic one if something completely unexpected happens.
      if (err instanceof AppError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected system error occurred.");
      }

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, resultImage, generate, clearError, reset };
};
