
import { useState, useCallback, useRef, useEffect } from 'react';
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
  rotation: number;
  opacity: number;
}

export const useMerchController = (onImageGenerated?: (url: string, prompt: string) => void) => {
  // Asset State
  const [assets, setAssets] = useState<{ logo: string | null; bg: string | null }>({
    logo: null,
    bg: null
  });
  const [loadingAssets, setLoadingAssets] = useState<{ logo: boolean; bg: boolean }>({
    logo: false,
    bg: false
  });

  // Configuration State
  const [config, setConfig] = useState<{ product: MerchProduct; style: string }>({
    product: MERCH_PRODUCTS[0],
    style: ''
  });
  
  // Text Overlay State
  const [textOverlay, setTextOverlay] = useState<TextOverlayState>({
    text: '',
    font: 'Inter, sans-serif',
    color: '#ffffff',
    size: 40,
    x: 50,
    y: 50,
    align: 'center',
    rotation: 0,
    opacity: 100
  });

  // UI/Error State
  const [validationError, setValidationError] = useState<string | null>(null);
  const [variations, setVariations] = useState<string[]>([]);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const variationsAbortController = useRef<AbortController | null>(null);

  // Main Generation Hook
  const { loading, error: apiError, resultImage, generate, clearError, reset: resetGenAI } = useGenAI();

  // Derived State
  const activeError = validationError || apiError;
  const errorSuggestion = activeError ? getErrorSuggestion(activeError, !!assets.bg) : null;

  // Cleanup
  useEffect(() => {
    return () => {
      variationsAbortController.current?.abort();
    };
  }, []);

  // -- Handlers --

  const handleAssetUpload = useCallback(async (file: File, type: 'logo' | 'bg') => {
    setLoadingAssets(prev => ({ ...prev, [type]: true }));
    setValidationError(null);
    if (type === 'logo') {
      resetGenAI();
      setVariations([]);
    }

    try {
      const base64 = await readImageFile(file);
      setAssets(prev => ({ ...prev, [type]: base64 }));
    } catch (error: any) {
      console.error(error);
      setValidationError(error.message || `Failed to upload ${type}`);
    } finally {
      setLoadingAssets(prev => ({ ...prev, [type]: false }));
    }
  }, [resetGenAI]);

  const clearAsset = useCallback((type: 'logo' | 'bg') => {
    setAssets(prev => ({ ...prev, [type]: null }));
    if (type === 'logo') {
      resetGenAI();
      setVariations([]);
    }
  }, [resetGenAI]);

  const handleGenerate = useCallback(async () => {
    if (!assets.logo) return;

    setVariations([]);
    const finalPrompt = constructMerchPrompt(config.product, config.style, !!assets.bg);
    const additionalImages: string[] = assets.bg ? [assets.bg] : [];
    
    await generate(assets.logo, finalPrompt, additionalImages);
  }, [assets, config, generate]);

  const handleGenerateVariations = useCallback(async () => {
    if (!assets.logo) return;

    variationsAbortController.current?.abort();
    const controller = new AbortController();
    variationsAbortController.current = controller;

    setIsGeneratingVariations(true);
    setValidationError(null);

    try {
      const prompts = getVariationPrompts(config.product, config.style, !!assets.bg);
      const additionalImages: string[] = assets.bg ? [assets.bg] : [];
      
      const results = await generateImageBatch(
        assets.logo, 
        prompts, 
        additionalImages,
        { signal: controller.signal }
      );
      
      if (!controller.signal.aborted) {
        if (results.length === 0) {
          setValidationError("Failed to generate variations. The model might be busy.");
        } else {
          setVariations(results);
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setValidationError(err.message || "Failed to generate variations");
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsGeneratingVariations(false);
      }
    }
  }, [assets, config]);

  // Sync result with parent
  useEffect(() => {
    if (resultImage && onImageGenerated && !loading) {
       const prompt = constructMerchPrompt(config.product, config.style, !!assets.bg);
       onImageGenerated(resultImage, prompt);
    }
  }, [resultImage, loading, onImageGenerated, config, assets.bg]);

  return {
    logoImage: assets.logo,
    bgImage: assets.bg,
    selectedProduct: config.product,
    stylePreference: config.style,
    resultImage,
    loading,
    variations,
    isGeneratingVariations,
    activeError,
    errorSuggestion,
    isUploadingLogo: loadingAssets.logo,
    isUploadingBg: loadingAssets.bg,
    textOverlay,
    
    setSelectedProduct: (p: MerchProduct) => setConfig(prev => ({ ...prev, product: p })),
    setStylePreference: (s: string) => setConfig(prev => ({ ...prev, style: s })),
    setTextOverlay,
    
    handleLogoUpload: (f: File) => handleAssetUpload(f, 'logo'),
    handleBgUpload: (f: File) => handleAssetUpload(f, 'bg'),
    handleGenerate,
    handleGenerateVariations,
    clearLogo: () => clearAsset('logo'),
    clearBg: () => clearAsset('bg'),
    clearActiveError: useCallback(() => {
      setValidationError(null);
      clearError();
    }, [clearError])
  };
};
