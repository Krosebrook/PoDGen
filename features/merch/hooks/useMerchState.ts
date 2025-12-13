
import React, { useState, useCallback } from 'react';
import { MerchProduct } from '../types';
import { MERCH_PRODUCTS } from '../data/products';
import { readImageFile } from '@/shared/utils/file';
import { useGenAI } from '@/shared/hooks/useGenAI';
import { constructMerchPrompt, getErrorSuggestion, getVariationPrompts } from '../utils';
import { generateImageBatch } from '@/services/gemini';

export interface TextOverlayState {
  text: string;
  font: string;
  color: string;
  size: number;
  x: number;
  y: number;
  align: 'left' | 'center' | 'right';
}

export const useMerchController = (onImageGenerated?: (url: string, prompt: string) => void) => {
  // State
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MerchProduct>(MERCH_PRODUCTS[0]);
  const [stylePreference, setStylePreference] = useState('');
  
  // Text Overlay State
  const [textOverlay, setTextOverlay] = useState<TextOverlayState>({
    text: '',
    font: 'Inter, sans-serif',
    color: '#ffffff',
    size: 40,
    x: 50, // Percent
    y: 50,  // Percent
    align: 'center'
  });
  
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Variations State
  const [variations, setVariations] = useState<string[]>([]);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);

  // Composition: Use GenAI hook for main generation
  const { loading, error: apiError, resultImage, generate, clearError, reset: resetGenAI } = useGenAI();

  // Derived State
  const activeError = validationError || apiError;
  const errorSuggestion = activeError ? getErrorSuggestion(activeError, !!bgImage) : null;

  // Actions
  const handleLogoUpload = useCallback(async (file: File) => {
    setIsUploadingLogo(true);
    setValidationError(null);
    resetGenAI();
    setVariations([]); // Reset variations on new logo
    try {
      const base64 = await readImageFile(file);
      setLogoImage(base64);
    } catch (error: any) {
      console.error(error);
      setValidationError(error.message || "Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
    }
  }, [resetGenAI]);

  const handleBgUpload = useCallback(async (file: File) => {
    setIsUploadingBg(true);
    setValidationError(null);
    setVariations([]); // Reset variations on new bg
    try {
      const base64 = await readImageFile(file);
      setBgImage(base64);
    } catch (error: any) {
      console.error(error);
      setValidationError(error.message || "Failed to upload background");
    } finally {
      setIsUploadingBg(false);
    }
  }, []);

  const clearLogo = useCallback(() => {
    setLogoImage(null);
    resetGenAI();
    setVariations([]);
  }, [resetGenAI]);

  const clearBg = useCallback(() => setBgImage(null), []);
  
  const clearActiveError = useCallback(() => {
    setValidationError(null);
    clearError();
  }, [clearError]);

  const handleGenerate = useCallback(async () => {
    if (!logoImage) return;

    setVariations([]); // Clear previous variations
    const finalPrompt = constructMerchPrompt(selectedProduct, stylePreference, !!bgImage);
    const additionalImages: string[] = bgImage ? [bgImage] : [];
    
    await generate(logoImage, finalPrompt, additionalImages);
  }, [logoImage, bgImage, selectedProduct, stylePreference, generate]);

  const handleGenerateVariations = useCallback(async () => {
    if (!logoImage) return;

    setIsGeneratingVariations(true);
    setValidationError(null);

    try {
      const prompts = getVariationPrompts(selectedProduct, stylePreference, !!bgImage);
      const additionalImages: string[] = bgImage ? [bgImage] : [];
      
      const results = await generateImageBatch(logoImage, prompts, additionalImages);
      
      if (results.length === 0) {
        setValidationError("Failed to generate variations. The model might be busy.");
      } else {
        setVariations(results);
      }
    } catch (err: any) {
      console.error("Variation generation error:", err);
      setValidationError(err.message || "Failed to generate variations");
    } finally {
      setIsGeneratingVariations(false);
    }
  }, [logoImage, bgImage, selectedProduct, stylePreference]);

  // Trigger callback when result changes
  React.useEffect(() => {
    if (resultImage && onImageGenerated && !loading) {
       const prompt = constructMerchPrompt(selectedProduct, stylePreference, !!bgImage);
       onImageGenerated(resultImage, prompt);
    }
  }, [resultImage, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // Data
    logoImage,
    bgImage,
    selectedProduct,
    stylePreference,
    resultImage,
    loading,
    variations,
    isGeneratingVariations,
    activeError,
    errorSuggestion,
    isUploadingLogo,
    isUploadingBg,
    textOverlay,
    
    // Setters
    setSelectedProduct,
    setStylePreference,
    setVariations, // Exposed to allow selecting a variation as main
    setTextOverlay,
    
    // Handlers
    handleLogoUpload,
    handleBgUpload,
    handleGenerate,
    handleGenerateVariations,
    clearLogo,
    clearBg,
    clearActiveError
  };
};
