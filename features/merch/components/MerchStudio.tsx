
import React, { Suspense, useState } from 'react';
import { useMerchController } from '../hooks/useMerchState';
import { Alert, Button, Spinner, Tooltip } from '@/shared/components/ui';
import { StepSection } from './StepSection';
import { Layers, Sparkles, Lightbulb, Box, Image as ImageIcon } from 'lucide-react';

// Lazy load heavy components
const ProductGrid = React.lazy(() => import('./ProductGrid').then(module => ({ default: module.ProductGrid })));
const UploadArea = React.lazy(() => import('./UploadArea').then(module => ({ default: module.UploadArea })));
const StyleSelector = React.lazy(() => import('./StyleSelector').then(module => ({ default: module.StyleSelector })));
const TextOverlayControls = React.lazy(() => import('./TextOverlayControls').then(module => ({ default: module.TextOverlayControls })));
const MerchPreview = React.lazy(() => import('./MerchPreview').then(module => ({ default: module.MerchPreview })));
const Merch3DViewer = React.lazy(() => import('./Merch3DViewer').then(module => ({ default: module.Merch3DViewer })));

interface MerchStudioProps {
  onImageGenerated: (url: string, prompt: string) => void;
}

const ControlFallback = () => (
  <div className="flex justify-center items-center py-8">
    <Spinner className="w-5 h-5 text-slate-500" />
  </div>
);

const PreviewFallback = () => (
  <div className="bg-slate-900 rounded-2xl border border-slate-700 h-[500px] flex items-center justify-center">
    <div className="flex flex-col items-center gap-2">
      <Spinner className="w-8 h-8 text-blue-500" />
      <span className="text-slate-500 text-sm">Loading Studio...</span>
    </div>
  </div>
);

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
  const isGenerateDisabled = !logoImage || isUploadingLogo || isUploadingBg;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-full">
      {/* Sidebar Controls */}
      <div className="lg:col-span-4 xl:col-span-3 flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-20">
        
        <StepSection number={1} title="Upload Brand Asset">
          <Suspense fallback={<ControlFallback />}>
            <UploadArea 
              image={logoImage} 
              onFileSelect={(f) => handleLogoUpload(f)} 
              placeholder="Upload Logo or Design"
              onClear={logoImage ? clearLogo : undefined}
              loading={isUploadingLogo}
            />
          </Suspense>
        </StepSection>

        <StepSection number={2} title="Select Product">
          <Suspense fallback={<ControlFallback />}>
            <ProductGrid selectedId={selectedProduct.id} onSelect={setSelectedProduct} />
          </Suspense>
        </StepSection>

        <StepSection number={3} title="Scene Background (Optional)">
           <Suspense fallback={<ControlFallback />}>
             <UploadArea 
              image={bgImage}
              onFileSelect={(f) => handleBgUpload(f)}
              onClear={clearBg}
              placeholder="Upload Background Scene"
              loading={isUploadingBg}
             />
           </Suspense>
           <p className="text-xs text-slate-500 mt-2 px-1">
             Upload a specific environment (e.g., table, street) or keep empty for a default studio background.
           </p>
        </StepSection>

        <StepSection number={4} title="Style Preference">
           <Suspense fallback={<ControlFallback />}>
             <StyleSelector 
               value={stylePreference} 
               onChange={setStylePreference} 
               productName={selectedProduct.name}
             />
           </Suspense>
        </StepSection>

        <StepSection number={5} title="Add Text Overlay">
           <Suspense fallback={<ControlFallback />}>
             <TextOverlayControls 
               overlay={textOverlay}
               onChange={setTextOverlay}
               disabled={!resultImage}
             />
           </Suspense>
        </StepSection>

        {activeError && (
          <div className="animate-fadeIn">
            <Alert message={activeError} onDismiss={clearActiveError} />
            {errorSuggestion && (
              <div className="mt-2 text-xs text-blue-200/90 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 flex gap-2 items-start">
                <Lightbulb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{errorSuggestion}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex flex-col gap-3 mt-2">
          <Tooltip 
            content={isGenerateDisabled ? "Upload a logo to start" : "Generate high-res mockup"}
            side="top"
          >
            <div className="w-full">
              <Button 
                onClick={handleGenerate} 
                loading={loading}
                loadingText="Generating Mockup..."
                disabled={isGenerateDisabled}
                icon={<Layers className="w-6 h-6" />}
                className={`w-full py-4 text-lg transition-all duration-300 ${
                  isGenerateDisabled
                    ? 'grayscale' 
                    : 'shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] hover:-translate-y-0.5'
                }`}
              >
                Generate Mockup
              </Button>
            </div>
          </Tooltip>

          {/* Explicit Variations Button */}
          {!loading && resultImage && (
             <Button 
                variant="secondary"
                onClick={handleGenerateVariations}
                loading={isGeneratingVariations}
                loadingText="Creating Variations..."
                icon={<Sparkles className="w-4 h-4 text-indigo-300" />}
                className="w-full border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-200 shadow-sm transition-all hover:border-indigo-500/50"
             >
               Generate 5 Variations
             </Button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full">
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-200">
               {viewMode === '2D' ? 'AI Generated Preview' : '3D Product Inspector'}
            </h2>
            
            {/* View Mode Toggle */}
            <div className="bg-slate-800 p-1 rounded-lg flex border border-slate-700">
               <button
                  onClick={() => setViewMode('2D')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === '2D' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
               >
                  <ImageIcon className="w-4 h-4" />
                  AI Mockup
               </button>
               <button
                  onClick={() => setViewMode('3D')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === '3D' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  disabled={!logoImage}
                  title={!logoImage ? "Upload a logo first" : ""}
               >
                  <Box className="w-4 h-4" />
                  3D View
               </button>
            </div>
         </div>

         <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden relative min-h-[500px]">
           <Suspense fallback={<PreviewFallback />}>
             {viewMode === '2D' ? (
                <MerchPreview 
                    loading={loading}
                    resultImage={resultImage}
                    variations={variations}
                    isGeneratingVariations={isGeneratingVariations}
                    onGenerateVariations={handleGenerateVariations}
                    error={activeError}
                    errorSuggestion={errorSuggestion}
                    productName={selectedProduct.name}
                    stylePreference={stylePreference}
                    productId={selectedProduct.id}
                    textOverlay={textOverlay}
                    onTextOverlayChange={setTextOverlay}
                />
             ) : (
                logoImage ? (
                  <Merch3DViewer logo={logoImage} productName={selectedProduct.name} />
                ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                      <Box className="w-16 h-16 opacity-20" />
                      <p>Upload a logo to enable 3D inspection</p>
                   </div>
                )
             )}
           </Suspense>
         </div>
      </div>
    </div>
  );
};
