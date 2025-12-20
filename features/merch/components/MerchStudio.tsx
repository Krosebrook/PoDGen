
import React, { useState } from 'react';
import { useMerchController } from '../hooks/useMerchState';
import { MerchStudioSidebar } from './MerchStudioSidebar';
import { MerchStudioViewport } from './MerchStudioViewport';

interface MerchStudioProps {
  onImageGenerated: (url: string, prompt: string) => void;
}

export const MerchStudio: React.FC<MerchStudioProps> = ({ onImageGenerated }) => {
  const {
    logoImage, bgImage, selectedProduct, stylePreference,
    resultImage, loading, variations, isGeneratingVariations,
    activeError, errorSuggestion,
    isUploadingLogo, isUploadingBg,
    textOverlay,
    setSelectedProduct, setStylePreference, setTextOverlay,
    handleLogoUpload, handleBgUpload, handleGenerate, handleGenerateVariations,
    clearLogo, clearBg, clearActiveError
  } = useMerchController(onImageGenerated);

  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-0">
      <MerchStudioSidebar 
        logoImage={logoImage}
        bgImage={bgImage}
        selectedProduct={selectedProduct}
        stylePreference={stylePreference}
        textOverlay={textOverlay}
        loading={loading}
        resultImage={resultImage}
        isGeneratingVariations={isGeneratingVariations}
        isUploadingLogo={isUploadingLogo}
        isUploadingBg={isUploadingBg}
        activeError={activeError}
        errorSuggestion={errorSuggestion}
        onSelectProduct={setSelectedProduct}
        onStyleChange={setStylePreference}
        onTextOverlayChange={setTextOverlay}
        onLogoUpload={handleLogoUpload}
        onBgUpload={handleBgUpload}
        onGenerate={handleGenerate}
        onGenerateVariations={handleGenerateVariations}
        onClearLogo={clearLogo}
        onClearBg={clearBg}
        onClearError={clearActiveError}
        onReset={() => {
          clearLogo();
          clearBg();
          clearActiveError();
        }}
      />

      <MerchStudioViewport 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        logoImage={logoImage}
        loading={loading}
        resultImage={resultImage}
        variations={variations}
        isGeneratingVariations={isGeneratingVariations}
        activeError={activeError}
        errorSuggestion={errorSuggestion}
        selectedProduct={selectedProduct}
        stylePreference={stylePreference}
        textOverlay={textOverlay}
        onGenerateVariations={handleGenerateVariations}
        onTextOverlayChange={setTextOverlay}
      />
    </div>
  );
};
