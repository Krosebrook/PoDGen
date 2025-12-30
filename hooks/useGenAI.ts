import { useState, useCallback } from 'react';
// Correcting the import to use the exported geminiService instance from services/gemini
import { geminiService } from '../services/gemini';
import { AppError } from '../shared/utils/errors';
import { logger } from '../shared/utils/logger';

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
      // Fix: Call geminiService.request with required arguments. 
      // We pass the prompt first, then an array containing the source image and any additions.
      const result = await geminiService.request(prompt, [imageBase64, ...additionalImages], {
        model: 'gemini-2.5-flash-image'
      });
      
      // Update the result image state with the synthesized image from the AI response
      setResultImage(result.image || null);
      return true;
    } catch (err: any) {
      logger.error("GenAI Hook caught error", err);
      
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