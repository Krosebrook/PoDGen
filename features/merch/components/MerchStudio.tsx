import React from 'react';
import { useMerchController } from '../hooks/useMerchState';
import { MerchStudioSidebar } from './MerchStudioSidebar';
import { MerchStudioViewport } from './MerchStudioViewport';

interface MerchStudioProps {
  onImageGenerated: (url: string, prompt: string) => void;
}

/**
 * MerchStudio Root Component
 * Refactored to use an explicit CSS Grid for structural stability.
 * Sidebar: Flexible width constrained between 340px and 420px via clamp.
 * Viewport: Fills 1fr (remaining space).
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
      className="grid grid-cols-1 lg:grid-cols-[clamp(340px,30%,420px)_1fr] gap-8 xl:gap-12 h-full lg:h-[calc(100vh-180px)] min-h-0 w-full"
      role="region"
      aria-label="Merch Design Studio"
    >
      {/* Design Control Column (Sidebar) */}
      <section className="h-full min-h-0 overflow-hidden flex flex-col order-2 lg:order-1">
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
      </section>

      {/* Main Preview Column (Viewport) */}
      <section className="h-full min-h-0 overflow-hidden flex flex-col order-1 lg:order-2">
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
      </section>
    </div>
  );
};