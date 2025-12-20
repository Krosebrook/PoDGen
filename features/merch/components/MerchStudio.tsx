import React from 'react';
import { useMerchController } from '../hooks/useMerchState';
import { MerchStudioSidebar } from './MerchStudioSidebar';
import { MerchStudioViewport } from './MerchStudioViewport';

interface MerchStudioProps {
  onImageGenerated: (url: string, prompt: string) => void;
}

/**
 * MerchStudio Root Component
 * Refactored to focus exclusively on high-fidelity 2D mockup synthesis.
 * Compliance: WCAG 2.1 AA (Aria landmarks, responsive grid, focus management)
 */
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

  return (
    <div 
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-0 w-full"
      role="region"
      aria-label="Merch Design Studio"
    >
      {/* Configuration Column (Sidebar) */}
      <div className="lg:col-span-4 xl:col-span-3 h-full min-h-0">
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
      </div>

      {/* Main Preview Column (Viewport) */}
      <div className="lg:col-span-8 xl:col-span-9 h-full min-h-0">
        <MerchStudioViewport 
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
    </div>
  );
};