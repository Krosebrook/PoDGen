import { useState, useCallback, useRef, useEffect } from 'react';
import { MerchProduct } from '../types';
import { MERCH_PRODUCTS } from '../data/products';
import { readImageFile } from '@/shared/utils/file';
import { geminiService } from '@/services/gemini';
import { constructMerchPrompt, getErrorSuggestion, getVariationPrompts } from '../utils';
import { logger } from '@/shared/utils/logger';

export interface TextOverlayState {
  text: string;
  font: string;
  color: string;
  size: number;
  x: number;
  y: number;
  align: 'left' | 'center' | 'right';
  rotation: number;
  skewX: number;
  underline: boolean;
  strikethrough: boolean;
  opacity: number;
  bgEnabled: boolean;
  bgColor: string;
  bgPadding: number;
  bgOpacity: number;
  bgRounding: number;
}

export const useMerchController = (onImageGenerated?: (url: string, prompt: string) => void) => {
  const [assets, setAssets] = useState<{ logo: string | null; bg: string | null }>({ logo: null, bg: null });
  const [loadingAssets, setLoadingAssets] = useState({ logo: false, bg: false });
  const [config, setConfig] = useState({ product: MERCH_PRODUCTS[0], style: '' });
  const [textOverlay, setTextOverlay] = useState<TextOverlayState>({
    text: '', font: 'Inter, sans-serif', color: '#ffffff', size: 40, x: 50, y: 50,
    align: 'center', rotation: 0, skewX: 0, underline: false, strikethrough: false,
    opacity: 100, bgEnabled: false, bgColor: '#000000', bgPadding: 16, bgOpacity: 50, bgRounding: 8
  });

  const [resultImage, setResultImage] = useState<string | null>(null);
  const [variations, setVariations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssetUpload = useCallback(async (file: File, type: 'logo' | 'bg') => {
    setLoadingAssets(prev => ({ ...prev, [type]: true }));
    setError(null);
    try {
      const base64 = await readImageFile(file);
      setAssets(prev => ({ ...prev, [type]: base64 }));
      if (type === 'logo') {
        setResultImage(null);
        setVariations([]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAssets(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!assets.logo || loading) return;
    setLoading(true);
    setError(null);
    try {
      const prompt = constructMerchPrompt(config.product, config.style, !!assets.bg);
      const res = await geminiService.request(prompt, assets.bg ? [assets.logo, assets.bg] : [assets.logo], {
        model: 'gemini-2.5-flash-image'
      });
      if (res.image) {
        setResultImage(res.image);
        onImageGenerated?.(res.image, prompt);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [assets, config, loading, onImageGenerated]);

  const handleGenerateVariations = useCallback(async () => {
    if (!assets.logo || isGeneratingVariations) return;
    setIsGeneratingVariations(true);
    setError(null);
    try {
      const prompts = getVariationPrompts(config.product, config.style, !!assets.bg);
      const results = await Promise.all(
        prompts.map(p => geminiService.request(p, assets.bg ? [assets.logo, assets.bg] : [assets.logo], {
          model: 'gemini-2.5-flash-image',
          maxRetries: 1
        }).catch(() => null))
      );
      const images = results.map(r => r?.image).filter((img): img is string => !!img);
      setVariations(images);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGeneratingVariations(false);
    }
  }, [assets, config, isGeneratingVariations]);

  return {
    logoImage: assets.logo, bgImage: assets.bg, selectedProduct: config.product,
    stylePreference: config.style, resultImage, loading, variations, isGeneratingVariations,
    activeError: error, errorSuggestion: error ? getErrorSuggestion(error, !!assets.bg) : null,
    isUploadingLogo: loadingAssets.logo, isUploadingBg: loadingAssets.bg, textOverlay,
    setSelectedProduct: (p: MerchProduct) => setConfig(prev => ({ ...prev, product: p })),
    setStylePreference: (s: string) => setConfig(prev => ({ ...prev, style: s })),
    setTextOverlay,
    handleLogoUpload: (f: File) => handleAssetUpload(f, 'logo'),
    handleBgUpload: (f: File) => handleAssetUpload(f, 'bg'),
    handleGenerate, handleGenerateVariations,
    clearLogo: () => { setAssets(p => ({ ...p, logo: null })); setResultImage(null); setVariations([]); },
    clearBg: () => setAssets(p => ({ ...p, bg: null })),
    clearActiveError: () => setError(null)
  };
};
