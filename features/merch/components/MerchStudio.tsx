import React from 'react';
import { useMerchState } from '../hooks/useMerchState';
import { useGenAI } from '@/shared/hooks/useGenAI';
import { Spinner } from '@/shared/components/ui/Spinner';
import { Alert } from '@/shared/components/ui/Alert';
import { Button } from '@/shared/components/ui/Button';
import { StepSection } from './StepSection';
import { ProductGrid } from './ProductGrid';
import { UploadArea } from './UploadArea';
import { StyleSelector } from './StyleSelector';
import { ShoppingBag, Download, Layers, AlertCircle } from 'lucide-react';

interface MerchStudioProps {
  onImageGenerated: (url: string, prompt: string) => void;
}

export const MerchStudio: React.FC<MerchStudioProps> = ({ onImageGenerated }) => {
  const { 
    logoImage, bgImage, selectedProduct, stylePreference,
    setSelectedProduct, setStylePreference, handleLogoUpload, handleBgUpload,
    clearLogo, clearBg
  } = useMerchState();

  const { loading, error, resultImage, generate, clearError, reset } = useGenAI();

  const onLogoSelect = async (file: File) => {
    reset(); 
    try {
      await handleLogoUpload(file);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const onBgSelect = async (file: File) => {
    try {
      await handleBgUpload(file);
    } catch (err: any) {
      alert(err.message);
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
    } else if (!success) {
      // Don't clear logo automatically on error to allow retry, unless strict requirement
      // clearLogo(); 
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      {/* Sidebar Controls */}
      <div className="lg:col-span-4 flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-20">
        
        <StepSection number={1} title="Upload Brand Asset">
          <UploadArea 
            image={logoImage} 
            onFileSelect={onLogoSelect} 
            placeholder="Upload Logo or Design"
            onClear={logoImage ? clearLogo : undefined}
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
           />
           <p className="text-xs text-slate-500 mt-2 px-1">
             Upload a specific environment (e.g., table, street) or keep empty for a default studio background.
           </p>
        </StepSection>

        <StepSection number={4} title="Style Preference">
           <StyleSelector value={stylePreference} onChange={setStylePreference} />
        </StepSection>

        {error && (
          <div className="animate-fadeIn">
            <Alert message={error} onDismiss={clearError} />
          </div>
        )}

        <Button 
          onClick={handleGenerate} 
          loading={loading}
          loadingText="Generating Mockup..."
          disabled={!logoImage}
          icon={<Layers className="w-6 h-6" />}
          className="w-full mt-2 py-4 text-lg"
        >
          Generate Mockup
        </Button>
      </div>

      {/* Preview Area */}
      <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-700 p-1 relative overflow-hidden flex flex-col min-h-[500px]">
          <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-medium text-white flex items-center gap-2">
             <span>{selectedProduct.name} Preview</span>
             {stylePreference && <span className="text-slate-400 border-l border-white/20 pl-2">{stylePreference}</span>}
          </div>
          
          <div className="flex-1 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950">
             {loading ? (
                <div className="flex flex-col items-center">
                   <Spinner className="w-16 h-16 text-indigo-500 mb-6" />
                   <p className="text-xl text-slate-300 font-light tracking-wide animate-pulse">Designing your {selectedProduct.name}...</p>
                </div>
             ) : resultImage ? (
                <img src={resultImage} alt="Merch Mockup" className="max-w-full max-h-full object-contain rounded shadow-2xl" />
             ) : error ? (
                <div className="text-center opacity-80 max-w-md px-6">
                   <div className="bg-red-500/10 p-6 rounded-full inline-block mb-4">
                     <AlertCircle className="w-12 h-12 text-red-400" />
                   </div>
                   <h2 className="text-xl font-bold text-red-400">Generation Failed</h2>
                   <p className="text-slate-400 mt-2">Please check the error details and try again.</p>
                </div>
             ) : (
                <div className="text-center opacity-30">
                   <ShoppingBag className="w-32 h-32 mx-auto mb-4" />
                   <h2 className="text-2xl font-bold">Ready to Design</h2>
                   <p>Upload a logo and select a product to begin</p>
                </div>
             )}
          </div>

          {resultImage && (
            <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-between items-center">
               <div className="text-sm text-slate-400">
                  Generated with Gemini 2.5 Flash Image
               </div>
               <a 
                 href={resultImage} 
                 download={`merch-${selectedProduct.id}.png`}
                 className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
               >
                 <Download className="w-4 h-4" /> Download High-Res
               </a>
            </div>
          )}
      </div>
    </div>
  );
};