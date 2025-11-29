import { useState, useCallback } from 'react';
import { generateOrEditImage } from '../services/gemini';

interface UseGenAIResult {
  loading: boolean;
  error: string | null;
  resultImage: string | null;
  generate: (imageBase64: string, prompt: string) => Promise<boolean>;
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

  const generate = useCallback(async (imageBase64: string, prompt: string): Promise<boolean> => {
    if (!imageBase64 || !prompt) return false;

    setLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const result = await generateOrEditImage(imageBase64, prompt);
      setResultImage(result);
      return true;
    } catch (err: any) {
      console.error("GenAI Error:", err);
      let msg = "An unexpected error occurred.";
      
      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err === 'string') {
        msg = err;
      }

      // Categorize common API errors
      if (msg.includes("403") || msg.toLowerCase().includes("api key")) {
        msg = "Access denied. Please verify your API key configuration.";
      } else if (msg.includes("429")) {
        msg = "System is busy (Rate Limit). Please wait a moment before trying again.";
      } else if (msg.toLowerCase().includes("safety")) {
        msg = "The request was blocked by safety filters. Try adjusting your prompt or source image.";
      } else if (msg.toLowerCase().includes("refused")) {
        msg = "The model refused the request. Try a simpler prompt or a clearer source image.";
      }

      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, resultImage, generate, clearError, reset };
};