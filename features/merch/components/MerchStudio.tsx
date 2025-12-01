
import React, { useRef } from 'react';
import { useMerchState } from '../hooks/useMerchState';
import { useGenAI } from '@/shared/hooks/useGenAI';
import { Spinner } from '@/shared/components/ui/Spinner';
import { Alert } from '@/shared/components/ui/Alert';
import { Button } from '@/shared/components/ui/Button';
import { StepSection } from './StepSection';
import { ProductGrid } from './ProductGrid';
import { Upload, ShoppingBag, Download, Layers, AlertCircle, Lightbulb, Image as ImageIcon, X } from 'lucide-react';

interface MerchStudioProps {
  onImageGenerated: (url: string, prompt: string) => void;
}

const STYLE_PRESETS = [
  'photorealistic',
  'vector art',
  'vintage poster',
  'minimalist branding'
];

export const MerchStudio: React.FC<MerchStudioProps> = ({ onImageGenerated }) => {
  const { 
    logoImage, bgImage, selectedProduct, stylePreference,
    setSelectedProduct, setStylePreference, handleLogoUpload, handleBgUpload,
    clearLogo, clearBg
  } = useMerchState();

  const { loading, error, resultImage, generate, clearError, reset } = useGenAI();
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const onLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      reset(); 
      try {
        await handleLogoUpload(file);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const onBgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await handleBgUpload(file);
      } catch (err: any) {
        alert(err.message);
      }
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

    if (success && onImageGenerated && resultImage) {
        // We might want to pass resultImage here but due to async state it might not be set yet 
        // in this closure if useGenAI doesn't return it.
        // However, useGenAI sets state. The useEffect in App.tsx might be better, or just rely on state.
    } else if (!success) {
      clearLogo(); 
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      {/* Sidebar */}
      <div className="lg:col-span-4 flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-20">
        
        {/* Step 1: Upload */}
        <StepSection number={1} title="Upload Brand Asset">
          <div 
            onClick={() => logoInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700/50 hover:border-blue-500 transition-all group relative overflow-hidden"
          >
            {logoImage ? (
               <div className="relative w-full aspect-square bg-slate-900/50 rounded flex items-center justify-center p-2">
                 <img src={logoImage} alt="Uploaded" className="max-w-full max-h-full object-contain" />
                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-sm font-medium">Change Image</span>
                 </div>
               </div>
            ) : (
               <>
                 <Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-blue-400" />
                 <span className="text-sm text-slate-400">Click to upload logo</span>
               </>
            )}
            <input type="file" ref={logoInputRef} onChange={onLogoChange} className="hidden" accept="image/*" />
          </div>
        </StepSection>

        {/* Step 2: Product */}
        <StepSection number={2} title="Select Product">
          <ProductGrid selectedId={selectedProduct.id} onSelect={setSelectedProduct} />
        </StepSection>

        {/* Step 3: Background */}
        <StepSection number={3} title="Scene Background (Optional)">
           <div className="space-y-2">
             <p className="text-xs text-slate-400 mb-2">Upload a specific environment or keep empty for default.</p>
             {bgImage ? (
                <div className="relative border border-slate-600 rounded-lg overflow-hidden group">
                  <img src={bgImage} alt="Background" className="w-full h-24 object-cover" />
                  <button 
                    onClick={() => { clearBg(); if(bgInputRef.current) bgInputRef.current.value = ''; }}
                    className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-red-500/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
             ) : (
                <div 
                  onClick={() => bgInputRef.current?.click()}
                  className="border border-dashed border-slate-600 rounded-lg p-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-800 hover:border-blue-400 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Upload Scene Image</span>
                </div>
             )}
             <input type="file" ref={bgInputRef} onChange={onBgChange} className="hidden" accept="image/*" />
           </div>
        </StepSection>

        {/* Step 4: Style */}
        <StepSection number={4} title="Style Preference">
           <input
             type="text"
             value={stylePreference}
             onChange={(e) => setStylePreference(e.target.value)}
             placeholder="E.g. minimalist, vintage, cyberpunk..."
             className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none text-sm mb-3"
           />
           <div className="flex flex-wrap gap-2">
             {STYLE_PRESETS.map((style) => (
               <button
                 key={style}
                 onClick={() => setStylePreference(style)}
                 className="px-2.5 py-1 rounded-full bg-slate-700 text-xs text-slate-300 hover:bg-slate-600 hover:text-white transition-colors border border-slate-600"
               >
                 {style}
               </button>
             ))}
           </div>
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

      {/* Main Area: Preview */}
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
                   <p className="text-slate-400 mt-2">The logo has been cleared. Please check the error message.</p>
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
