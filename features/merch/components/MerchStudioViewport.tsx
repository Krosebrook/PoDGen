
import React, { Suspense } from 'react';
import { ImageIcon, Box, LayoutGrid } from 'lucide-react';
import { Tooltip, Spinner } from '@/shared/components/ui';
import { MerchPreview } from './MerchPreview';
import { Merch3DViewer } from './Merch3DViewer';
import { MerchProduct } from '../types';
import { TextOverlayState } from '../hooks/useMerchState';

interface MerchStudioViewportProps {
  viewMode: '2D' | '3D';
  onViewModeChange: (mode: '2D' | '3D') => void;
  logoImage: string | null;
  loading: boolean;
  resultImage: string | null;
  variations: string[];
  isGeneratingVariations: boolean;
  activeError: string | null;
  errorSuggestion: string | null;
  selectedProduct: MerchProduct;
  stylePreference: string;
  textOverlay: TextOverlayState;
  onGenerateVariations: () => void;
  onTextOverlayChange: (overlay: TextOverlayState) => void;
}

export const MerchStudioViewport: React.FC<MerchStudioViewportProps> = ({
  viewMode, onViewModeChange, logoImage, loading, resultImage, variations,
  isGeneratingVariations, activeError, errorSuggestion,
  selectedProduct, stylePreference, textOverlay,
  onGenerateVariations, onTextOverlayChange
}) => {
  return (
    <main className="lg:col-span-8 xl:col-span-9 flex flex-col h-full min-h-0 animate-fadeIn">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-black text-white flex items-center gap-4 tracking-tighter uppercase">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-blue-500" aria-hidden="true" />
            </div>
            Studio Viewport
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] pl-14">
            Session Active: <span className="text-blue-400">{selectedProduct.name}</span>
          </p>
        </div>
        
        <div className="bg-slate-900/50 p-1.5 rounded-2xl flex border border-slate-800 shadow-xl backdrop-blur-xl self-stretch sm:self-auto" role="tablist" aria-label="View selection">
           <Tooltip content="Switch to 2D AI Render View">
             <button
                type="button"
                onClick={() => onViewModeChange('2D')}
                role="tab"
                aria-selected={viewMode === '2D'}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${viewMode === '2D' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
             >
                <ImageIcon className="w-4 h-4" aria-hidden="true" />
                2D MASTER
             </button>
           </Tooltip>
           <Tooltip content="Switch to 3D Real-time Simulator">
             <button
                type="button"
                onClick={() => onViewModeChange('3D')}
                role="tab"
                aria-selected={viewMode === '3D'}
                disabled={!logoImage}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-30 ${viewMode === '3D' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
             >
                <Box className="w-4 h-4" aria-hidden="true" />
                3D INSPECT
             </button>
           </Tooltip>
        </div>
      </header>

      <section className="flex-1 bg-slate-900/50 rounded-[3rem] border border-slate-800/40 overflow-hidden relative shadow-2xl min-h-0 ring-1 ring-white/5">
        <Suspense fallback={
          <div className="h-full flex flex-col items-center justify-center gap-6" aria-live="polite">
            <Spinner className="w-12 h-12 text-blue-500" />
            <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-[10px]">Synchronizing Viewport...</p>
          </div>
        }>
          {viewMode === '2D' ? (
            <MerchPreview 
                loading={loading}
                resultImage={resultImage}
                variations={variations}
                isGeneratingVariations={isGeneratingVariations}
                onGenerateVariations={onGenerateVariations}
                error={activeError}
                errorSuggestion={errorSuggestion}
                productName={selectedProduct.name}
                stylePreference={stylePreference}
                productId={selectedProduct.id}
                textOverlay={textOverlay}
                onTextOverlayChange={onTextOverlayChange}
            />
          ) : (
            logoImage ? (
              <Merch3DViewer logo={logoImage} productName={selectedProduct.name} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-8 px-12 text-center">
                <div className="w-40 h-40 bg-slate-800/10 rounded-[3rem] flex items-center justify-center border border-slate-800 shadow-inner group">
                  <Box className="w-20 h-20 opacity-10 group-hover:opacity-20 transition-all group-hover:scale-110" aria-hidden="true" />
                </div>
                <div className="max-w-xs space-y-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">3D Pipeline Offline</h3>
                  <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">
                    Attach a brand asset to initialize the 3D simulator
                  </p>
                </div>
              </div>
            )
          )}
        </Suspense>
      </section>
    </main>
  );
};
