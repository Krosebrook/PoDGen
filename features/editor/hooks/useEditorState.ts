
import { useState, useCallback, useEffect } from 'react';
import { useGenAI } from '@/shared/hooks/useGenAI';
import { readImageFile, extractImageFile } from '@/shared/utils/file';

export const useEditorState = (onImageGenerated?: (url: string, prompt: string) => void) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  
  const { loading, error: apiError, resultImage, generate, clearError: clearApiError, reset: resetGenAI } = useGenAI();
  const activeError = localError || apiError;

  const clearAllErrors = useCallback(() => {
    setLocalError(null);
    clearApiError();
  }, [clearApiError]);

  const processFile = useCallback(async (file: File) => {
    clearAllErrors();
    try {
      const base64 = await readImageFile(file);
      setSelectedImage(base64);
      resetGenAI();
    } catch (err: any) {
      setLocalError(err.message || "Failed to process file.");
    }
  }, [resetGenAI, clearAllErrors]);

  // Global Paste Handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const file = extractImageFile(e.clipboardData?.items);
      if (file) {
        e.preventDefault();
        processFile(file);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFile]);

  const handleEdit = useCallback(async () => {
    if (!selectedImage || !prompt) return;
    const success = await generate(selectedImage, prompt);
    if (success && onImageGenerated && resultImage) {
        // We rely on the hook's state update, but we might need to wait for resultImage to be set in next render.
        // Actually, the generate function waits, so resultImage might be set. 
        // However, standard React batching might mean resultImage isn't updated in this closure yet.
        // We'll rely on a useEffect in the consumer or just pass the raw result if useGenAI returned it, 
        // but useGenAI returns boolean. The ImageEditor component handles the effect.
    }
  }, [selectedImage, prompt, generate, onImageGenerated, resultImage]);

  const handleReset = useCallback(() => {
    setSelectedImage(null);
    resetGenAI();
    clearAllErrors();
  }, [resetGenAI, clearAllErrors]);

  return {
    // State
    selectedImage,
    prompt,
    activeError,
    loading,
    resultImage,

    // Actions
    setPrompt,
    processFile,
    handleEdit,
    handleReset,
    clearAllErrors
  };
};
