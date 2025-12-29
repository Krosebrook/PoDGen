import React from 'react';
import { useMerchController } from '../hooks/useMerchState';
import { MerchStudioSidebar } from './MerchStudioSidebar';
import { MerchStudioViewport } from './MerchStudioViewport';

interface MerchStudioProps {
  onImageGenerated: (url: string, prompt: string) => void;
}

/**
 * MerchStudio: High-performance design workspace.
 * 
 * Layout Implementation:
 * - Employs CSS Grid for the top-level dual-pane workspace.
 * - Sidebar: Constrained via clamp(340px, 30%, 420px) to prevent layout break on ultra-wide or small screens.
 * - Viewport: Fluid 1fr distribution to maximize visual canvas area.
 * 
 * UX Design:
 * - Responsive ordering: Viewport leads on mobile (order-1) for immediate visual feedback.
 * - Semantic landmarks: Uses aside/main/section for superior screen reader navigation.
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
        Side Navigation & Controls (Configuration Column)
        Order-2 on mobile ensures the interactive preview stays top-of-mind.
      */}
      <aside 
        className="h-full min-h-0 overflow-hidden flex flex-col order-2 lg:order-1"
        aria-label="Design Configuration Panel"
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
      </aside>

      {/* 
        Main Viewport & Preview (Primary Visual Column)
        Order-1 on mobile for immediate visual impact when clicking "Generate".
      */}
      <section 
        className="h-full min-h-0 overflow-hidden flex flex-col order-1 lg:order-2"
        aria-label="Product Preview Viewport"
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