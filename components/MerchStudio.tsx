import React, { useState, useRef } from 'react';
import { useGenAI } from '../hooks/useGenAI';
import { Spinner } from './ui/Spinner';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';
import { Upload, ShoppingBag, Download, Layers, AlertCircle, Lightbulb } from 'lucide-react';
import { MerchProduct } from '../types';
import { MERCH_PRODUCTS } from '../data/defaults';

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
  const [selectedProduct, setSelectedProduct] = useState<MerchProduct>(MERCH_PRODUCTS[0]);
  const [stylePreference, setStylePreference] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { loading, error, resultImage, generate, clearError, reset } = useGenAI();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Immediately reset previous results to avoid confusion
      reset();
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!logoImage) return;

    const style = stylePreference.trim() || "professional high-quality";
    const finalPrompt = selectedProduct.defaultPrompt.replace('{style_preference}', style);
    
    // Generate returns true if success, false if failed
    const success = await generate(logoImage, finalPrompt);

    if (success) {
      if (onImageGenerated) {
        // onImageGenerated callback if needed
      }
    } else {
      // If generation failed, clear the logo to force/prompt user to retry with potentially different settings/image
      // As requested: "modify the handleGenerate function to clear the logoImage state if the generation fails"
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
      <div className="lg:col-span-4 flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Step 1: Upload Logo */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">1</div>
             <h3 className="font-semibold text-slate-200">Upload Brand Asset</h3>
          </div>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700/50 hover:border-blue-500 transition-all group relative overflow-hidden"
          >
            {logoImage ? (
               <div className="relative w-full aspect-square bg-slate-900/50 rounded flex items-center justify-center p-2">
                 <img src={logoImage} alt="Logo" className="max-w-full max-h-full object-contain" />
                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-sm font-medium">Change Logo</span>
                 </div>
               </div>
            ) : (
               <>
                 <Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-blue-400" />
                 <span className="text-sm text-slate-400">Click to upload logo</span>
               </>
            )}
            <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
          </div>
        </div>

        {/* Step 2: Select Product */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex-1 min-h-[300px]">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">2</div>
             <h3 className="font-semibold text-slate-200">Select Product</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
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
        </div>

        {/* Step 3: Style Preference */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
           <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">3</div>
             <h3 className="font-semibold text-slate-200">Style Preference</h3>
           </div>
           <input
             type="text"
             value={stylePreference}
             onChange={(e) => setStylePreference(e.target.value)}
             placeholder="E.g. minimalist, vintage, cyberpunk, neon..."
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
        </div>

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
      <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-700 p-1 relative overflow-hidden flex flex-col">
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
                   <p className="text-slate-400 mt-2">The logo has been cleared. Please try uploading a different image or adjusting your style settings.</p>
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