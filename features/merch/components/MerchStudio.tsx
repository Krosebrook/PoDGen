
import React from 'react';
import { useMerchState } from '../hooks/useMerchState';
import { useGenAI } from '@/shared/hooks/useGenAI';
import { Alert, Button } from '@/shared/components/ui';
import { StepSection } from './StepSection';
import { ProductGrid } from './ProductGrid';
import { UploadArea } from './UploadArea';
import { StyleSelector } from './StyleSelector';
import { MerchPreview } from './MerchPreview';
import { Layers } from 'lucide-react';

interface MerchStudioProps {
  onImageGenerated: (url: string, prompt: string) => void;
}

export const MerchStudio: React.FC<MerchStudioProps> = ({ onImageGenerated }) => {
  const { 
    logoImage, bgImage, selectedProduct, stylePreference,
    setSelectedProduct, setStylePreference, handleLogoUpload, handleBgUpload,
    clearLogo, clearBg, isUploadingLogo, isUploadingBg, validationError, clearValidationError
  } = useMerchState();

  const { loading, error, resultImage, generate, clearError, reset } = useGenAI();

  // Combine validation errors and API errors
  const activeError = validationError || error;
  const clearActiveError = () => {
    clearValidationError();
    clearError();
  };

  const onLogoSelect = async (file: File) => {
    reset(); 
    clearActiveError();
    try {
      await handleLogoUpload(file);
    } catch (err: any) {
      // Error is handled in hook state
    }
  };

  const onBgSelect = async (file: File) => {
    clearActiveError();
    try {
      await handleBgUpload(file);
    } catch (err: any) {
      // Error is handled in hook state
    }
  };

  const handleGenerate = async () => {
    if (!logoImage) return;

    const style = stylePreference.trim() || "professional high-quality";
    let finalPrompt = selectedProduct.defaultPrompt.replace('{style_preference}', style);

    const additionalImages: string[] = [];
    
    if (bgImage) {
      finalPrompt = `Image 1 is a logo. Image 2 is a background scene. 
      Generate a ${style} mockup of a ${selectedProduct.name} (${selectedProduct.description}) placed naturally in the environment of Image 2. 
      Apply the logo from Image 1 onto the product realistically. 
      Ensure lighting and perspective match the background scene.`;
      additionalImages.push(bgImage);
    }
    
    const success = await generate(logoImage, finalPrompt, additionalImages);

    if (success && resultImage) {
      onImageGenerated(resultImage, finalPrompt);
    }
  };

  const getErrorSuggestion = (errorMsg: string): string => {
    const msg = errorMsg.toLowerCase();
    
    if (msg.includes("blocked") || msg.includes("safety") || msg.includes("policy")) {
        return "The AI flagged the content as unsafe. Try a logo with less sensitive visuals.";
    }
    if (msg.includes("429") || msg.includes("rate limit") || msg.includes("quota")) {
        return "System is busy (Rate Limited). Please wait 30 seconds before retrying.";
    }
    if (msg.includes("400") || msg.includes("invalid") || msg.includes("bad request")) {
        return "The image format might be unsupported. Try converting your logo to PNG or JPG.";
    }
    if (bgImage && (msg.includes("shape") || msg.includes("dimension") || msg.includes("compatibility"))) {
        return "The custom background might be causing issues. Try removing it to use the default studio background.";
    }
    if (msg.includes("size") || msg.includes("large") || msg.includes("payload")) {
        return "The uploaded image is too large. Please use an image under 5MB.";
    }
    return "Ensure your logo is high-contrast and clear. If using a custom background, ensure it's a standard image format.";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-full">
      {/* Sidebar Controls */}
      <div className="lg:col-span-4 xl:col-span-3 flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-20">
        
        <StepSection number={1} title="Upload Brand Asset">
          <UploadArea 
            image={logoImage} 
            onFileSelect={onLogoSelect} 
            placeholder="Upload Logo or Design"
            onClear={logoImage ? clearLogo : undefined}
            loading={isUploadingLogo}
          />
        </StepSection>

        <StepSection number={2} title="Select Product">
          <ProductGrid selectedId={selectedProduct.id} onSelect={setSelectedProduct} />
        </StepSection>

        <StepSection number={3} title="Scene Background (Optional)">
           <UploadArea 
            image={bgImage}
            onFileSelect={onBgSelect}
            onClear={clearBg}
            placeholder="Upload Background Scene"
            loading={isUploadingBg}
           />
           <p className="text-xs text-slate-500 mt-2 px-1">
             Upload a specific environment (e.g., table, street) or keep empty for a default studio background.
           </p>
        </StepSection>

        <StepSection number={4} title="Style Preference">
           <StyleSelector value={stylePreference} onChange={setStylePreference} />
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
         <MerchPreview 
            loading={loading}
            resultImage={resultImage}
            error={activeError}
            errorSuggestion={activeError ? getErrorSuggestion(activeError) : null}
            productName={selectedProduct.name}
            stylePreference={stylePreference}
            productId={selectedProduct.id}
         />
      </div>
    </div>
  );
};
