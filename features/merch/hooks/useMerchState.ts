
import { useState, useCallback } from 'react';
import { MerchProduct } from '../types';
import { MERCH_PRODUCTS } from '../data/products';
import { readImageFile } from '@/shared/utils/file';

export const useMerchState = () => {
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MerchProduct>(MERCH_PRODUCTS[0]);
  const [stylePreference, setStylePreference] = useState('');
  
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleLogoUpload = useCallback(async (file: File) => {
    setIsUploadingLogo(true);
    setValidationError(null);
    try {
      const base64 = await readImageFile(file);
      setLogoImage(base64);
      return true;
    } catch (error: any) {
      console.error(error);
      setValidationError(error.message || "Failed to upload logo");
      throw error;
    } finally {
      setIsUploadingLogo(false);
    }
  }, []);

  const handleBgUpload = useCallback(async (file: File) => {
    setIsUploadingBg(true);
    setValidationError(null);
    try {
      const base64 = await readImageFile(file);
      setBgImage(base64);
    } catch (error: any) {
      console.error(error);
      setValidationError(error.message || "Failed to upload background");
      throw error;
    } finally {
      setIsUploadingBg(false);
    }
  }, []);

  const clearLogo = useCallback(() => setLogoImage(null), []);
  const clearBg = useCallback(() => setBgImage(null), []);
  const clearValidationError = useCallback(() => setValidationError(null), []);

  return {
    logoImage,
    bgImage,
    selectedProduct,
    stylePreference,
    setSelectedProduct,
    setStylePreference,
    handleLogoUpload,
    handleBgUpload,
    clearLogo,
    clearBg,
    isUploadingLogo,
    isUploadingBg,
    validationError,
    clearValidationError
  };
};
