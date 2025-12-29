import React from 'react';
import { useMerchController } from '../hooks/useMerchState';
import { MerchStudioSidebar } from './MerchStudioSidebar';
import { MerchStudioViewport } from './MerchStudioViewport';

interface MerchStudioProps {
  onImageGenerated: (url: string, prompt: string) => void;
}

/**
 * MerchStudio Root Component
 * 
 * Implements a modern dual-pane workspace using CSS Grid.
 * Sidebar: Flexible width via clamp(340px, 30%, 420px) to ensure usability across display densities.
 * Viewport: Fluid 1fr distribution for maximum visual area.
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
      className="grid grid-cols-1 lg:grid-cols-[clamp(340px,30%,420px)_1fr] gap-8 xl:gap-12 h-full lg:h-[calc(100vh-180px)] min-h-0 w-full animate-fadeIn"
      role="main"
      aria-label="Merch Design Workspace"
    >
      {/* 
        Design Control Column (Sidebar) 
        On mobile, this appears below the preview (order-2) to prioritize visual feedback.
        On desktop, it is the primary controller (order-1).
      */}
      <section 
        className="h-full min-h-0 overflow-hidden flex flex-col order-2 lg:order-1"
        aria-label="Design Controls"
      >
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
          // Fix: Use correctly destructured setter names from useMerchController
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

      {/* 
        Main Preview Column (Viewport) 
        Prioritized on mobile devices (order-1).
      */}
      <section 
        className="h-full min-h-0 overflow-hidden flex flex-col order-1 lg:order-2"
        aria-label="Interactive Preview Viewport"
      >
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