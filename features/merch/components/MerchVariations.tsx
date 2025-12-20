import React from 'react';
import { Spinner, Tooltip } from '@/shared/components/ui';
import { Grid } from 'lucide-react';

interface MerchVariationsProps {
  variations: string[];
  isGenerating: boolean;
  activeImage: string | null;
  resultImage: string | null;
  onViewImage: (img: string | null) => void;
}

export const MerchVariations: React.FC<MerchVariationsProps> = ({
  variations,
  isGenerating,
  activeImage,
  resultImage,
  onViewImage
}) => {
  if (!isGenerating && variations.length === 0) return null;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 animate-fadeIn">
      <div className="flex items-center gap-2 mb-3">
        <Grid className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-semibold text-slate-200">Mockup Variations</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* If variations are loading, show skeletons */}
        {isGenerating ? Array(3).fill(0).map((_, i) => (
           <div key={i} className="aspect-square bg-slate-800 rounded-lg animate-pulse flex items-center justify-center border border-slate-700">
             <Spinner className="w-6 h-6 text-slate-600" />
           </div>
        )) : (
          <>
             {/* Main Result (Always option 1) */}
             {resultImage && (
                <Tooltip content="Restore the main viewport to show the original primary design" side="bottom">
                  <div 
                    onClick={() => onViewImage(null)} // Reset to show resultImage
                    className={`relative aspect-square bg-slate-800 rounded-lg overflow-hidden cursor-pointer border-2 transition-all group ${activeImage === resultImage ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent hover:border-slate-500'}`}
                  >
                    <img src={resultImage} alt="Original" className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 left-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white backdrop-blur-sm">Master</div>
                  </div>
                </Tooltip>
             )}

             {/* Variations */}
             {variations.map((img, idx) => (
                <Tooltip key={idx} content={`Switch the viewport to display alternative mockup variation ${idx + 1}`} side="bottom">
                  <div 
                    onClick={() => onViewImage(img)}
                    className={`relative aspect-square bg-slate-800 rounded-lg overflow-hidden cursor-pointer border-2 transition-all group ${activeImage === img ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent hover:border-slate-500'}`}
                  >
                    <img src={img} alt={`Variation ${idx}`} className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 left-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white backdrop-blur-sm">Var {idx + 1}</div>
                  </div>
                </Tooltip>
             ))}
          </>
        )}
      </div>
    </div>
  );
};