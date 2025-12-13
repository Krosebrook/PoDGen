import React, { useState, useRef } from 'react';
import { useGenAI } from '../hooks/useGenAI';
import { Spinner } from './ui/Spinner';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';
import { Upload, ShoppingBag, Download, Layers, AlertCircle, Lightbulb, Image as ImageIcon, X } from 'lucide-react';
import { MerchProduct } from '../features/merch/types';
import { MERCH_PRODUCTS } from '../features/merch/data/products';
import { readImageFile } from '../utils/file';

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
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MerchProduct>(MERCH_PRODUCTS[0]);
  const [stylePreference, setStylePreference] = useState('');
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const { loading, error, resultImage, generate, clearError, reset } = useGenAI();

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      reset(); // Clear previous results
      try {
        const base64 = await readImageFile(file);
        setLogoImage(base64);
      } catch (err: any) {
        console.error("Failed to read logo:", err);
        alert(err.message);
      }
    }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await readImageFile(file);
        setBgImage(base64);
      } catch (err: any) {
        console.error("Failed to read background:", err);
        alert(err.message);
      }
    }
  };

  const handleGenerate = async () => {
    if (!logoImage) return;

    const style = stylePreference.trim() || "professional high-quality";
    let finalPrompt = selectedProduct.defaultPrompt.replace('{style_preference}', style);

    const additionalImages: string[] = [];
    
    // If background image is present, modify logic to use it
    if (bgImage) {
      finalPrompt = `Image 1 is a logo. Image 2 is a background scene. 
      Generate a ${style} mockup of a ${selectedProduct.name} (${selectedProduct.description}) placed naturally in the environment of Image 2. 
      Apply the logo from Image 1 onto the product realistically. 
      Ensure lighting and perspective match the background scene.`;
      additionalImages.push(bgImage);
    }
    
    // Generate returns true if success, false if failed
    const success = await generate(logoImage, finalPrompt, additionalImages);

    if (success) {
      if (onImageGenerated) {
        onImageGenerated(resultImage!, finalPrompt);
      }
    } else {
      // Optional: Clear logo on critical failure? 
      // Current behavior: Keep inputs so user can retry, only clear if needed.
      // The requirement was "clear logo if API error", but keeping it might be better UX.
      // Let's stick to the previous request to clear it to indicate reset.
      setLogoImage(null); 
    }
  };

  const getErrorSuggestion = (errorMsg: string): string => {
    if (errorMsg.includes("blocked")) return "Suggestion: Try a different logo that contains less sensitive content.";
    if (errorMsg.includes("refused")) return "Suggestion: Ensure the logo is clear and distinct.";
    if (errorMsg.includes("Rate Limit")) return "Suggestion: Wait a few seconds before clicking Generate again.";
    return "Suggestion: Try a different logo file format or size.";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      {/* Sidebar: Controls */}
      <div className="lg:col-span-4 flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-20">
        
        {/* Step 1: Upload Logo */}
        <StepSection number={1} title="Upload Brand Asset">
          <UploadZone 
            image={logoImage} 
            inputRef={logoInputRef} 
            onUpload={handleLogoUpload} 
            placeholder="Click to upload logo" 
          />
        </StepSection>

        {/* Step 2: Select Product */}
        <StepSection number={2} title="Select Product">
          <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
             {MERCH_PRODUCTS.map(product => (
               <div 
                 key={product.id}
                 onClick={() => setSelectedProduct(product)}
                 className={`p-2 rounded-lg border cursor-pointer transition-all flex flex-col gap-2 ${selectedProduct.id === product.id ? 'bg-blue-600/10 border-blue-500 shadow-sm ring-1 ring-blue-500/50' : 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:bg-slate-800'}`}
               >
                 <div className="aspect-square w-full rounded-md bg-slate-800 overflow-hidden relative">
                    <img 
                      src={product.placeholderImage} 
                      alt={product.name} 
                      className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" 
                    />
                    {selectedProduct.id === product.id && (
                      <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
                    )}
                 </div>
                 <div className="px-1">
                   <h4 className={`text-xs font-medium truncate ${selectedProduct.id === product.id ? 'text-blue-100' : 'text-slate-300'}`}>{product.name}</h4>
                   <p className="text-[10px] text-slate-500 truncate">{product.description}</p>
                 </div>
               </div>
             ))}
          </div>
        </StepSection>

        {/* Step 3: Custom Background (Optional) */}
        <StepSection number={3} title="Scene Background (Optional)">
           <div className="space-y-2">
             <p className="text-xs text-slate-400 mb-2">Upload a specific environment or keep empty for default.</p>
             {bgImage ? (
                <div className="relative border border-slate-600 rounded-lg overflow-hidden group">
                  <img src={bgImage} alt="Background" className="w-full h-24 object-cover" />
                  <button 
                    onClick={() => { setBgImage(null); if(bgInputRef.current) bgInputRef.current.value = ''; }}
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
             <input type="file" ref={bgInputRef} onChange={handleBgUpload} className="hidden" accept="image/*" />
           </div>
        </StepSection>

        {/* Step 4: Style Preference */}
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
            <div className="mt-2 flex items-start gap-2 text-xs text-blue-300 bg-blue-900/10 p-2 rounded border border-blue-900/30">
              <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{getErrorSuggestion(error)}</span>
            </div>
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
                   <p className="text-slate-400 mt-2">The logo has been cleared to reset state. Please check the error message and try again.</p>
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

// Internal Components for cleaner render logic

const StepSection: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
  <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
    <div className="flex items-center gap-3 mb-4">
       <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">{number}</div>
       <h3 className="font-semibold text-slate-200">{title}</h3>
    </div>
    {children}
  </div>
);

const UploadZone: React.FC<{ 
  image: string | null; 
  inputRef: React.RefObject<HTMLInputElement>; 
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}> = ({ image, inputRef, onUpload, placeholder }) => (
  <div 
    onClick={() => inputRef.current?.click()}
    className="border-2 border-dashed border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700/50 hover:border-blue-500 transition-all group relative overflow-hidden"
  >
    {image ? (
       <div className="relative w-full aspect-square bg-slate-900/50 rounded flex items-center justify-center p-2">
         <img src={image} alt="Uploaded" className="max-w-full max-h-full object-contain" />
         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="text-white text-sm font-medium">Change Image</span>
         </div>
       </div>
    ) : (
       <>
         <Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-blue-400" />
         <span className="text-sm text-slate-400">{placeholder}</span>
       </>
    )}
    <input type="file" ref={inputRef} onChange={onUpload} className="hidden" accept="image/*" />
  </div>
);