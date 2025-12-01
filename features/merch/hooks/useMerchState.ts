
import { useState, useCallback } from 'react';
import { MerchProduct } from '../types';
import { MERCH_PRODUCTS } from '../data/products';
import { readImageFile } from '@/shared/utils/file';

export const useMerchState = () => {
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MerchProduct>(MERCH_PRODUCTS[0]);
  const [stylePreference, setStylePreference] = useState('');

  const handleLogoUpload = useCallback(async (file: File) => {
    try {
      const base64 = await readImageFile(file);
      setLogoImage(base64);
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, []);

  const handleBgUpload = useCallback(async (file: File) => {
    try {
      const base64 = await readImageFile(file);
      setBgImage(base64);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, []);

  const clearLogo = useCallback(() => setLogoImage(null), []);
  const clearBg = useCallback(() => setBgImage(null), []);

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
    clearBg
  };
};
