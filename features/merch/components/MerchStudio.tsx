
import React, { Suspense } from 'react';
import { useMerchController } from '../hooks/useMerchState';
import { Alert, Button, Spinner } from '@/shared/components/ui';
import { StepSection } from './StepSection';
import { Layers } from 'lucide-react';

// Lazy load heavy components
const ProductGrid = React.lazy(() => import('./ProductGrid').then(module => ({ default: module.ProductGrid })));
const UploadArea = React.lazy(() => import('./UploadArea').then(module => ({ default: module.UploadArea })));
const StyleSelector = React.lazy(() => import('./StyleSelector').then(module => ({ default: module.StyleSelector })));
const MerchPreview = React.lazy(() => import('./MerchPreview').then(module => ({ default: module.MerchPreview })));

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
    setSelectedProduct, setStylePreference,
    handleLogoUpload, handleBgUpload, handleGenerate, handleGenerateVariations,
    clearLogo, clearBg, clearActiveError
  } = useMerchController(onImageGenerated);

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
             <StyleSelector value={stylePreference} onChange={setStylePreference} />
           </Suspense>
        </StepSection>

        {activeError && (
          <div className="animate-fadeIn">
            <Alert message={activeError} onDismiss={clearActiveError} />
          </div>
        )}

        <Button 
          onClick={handleGenerate} 
          loading={loading}
          loadingText="Generating Mockup..."
          disabled={!logoImage || isUploadingLogo || isUploadingBg}
          icon={<Layers className="w-6 h-6" />}
          className="w-full mt-2 py-4 text-lg"
        >
          Generate Mockup
        </Button>
      </div>

      {/* Preview Area */}
      <div className="lg:col-span-8 xl:col-span-9">
         <Suspense fallback={<PreviewFallback />}>
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
           />
         </Suspense>
      </div>
    </div>
  );
};
