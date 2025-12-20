
import React, { Suspense } from 'react';
import { Settings2, RotateCcw, Layers, Sparkles, Lightbulb } from 'lucide-react';
import { Tooltip, Button, Alert } from '@/shared/components/ui';
import { StepSection } from './StepSection';
import { ProductGrid } from './ProductGrid';
import { UploadArea } from './UploadArea';
import { StyleSelector } from './StyleSelector';
import { TextOverlayControls } from './TextOverlayControls';
import { MerchProduct } from '../types';
import { TextOverlayState } from '../hooks/useMerchState';

interface MerchStudioSidebarProps {
  logoImage: string | null;
  bgImage: string | null;
  selectedProduct: MerchProduct;
  stylePreference: string;
  textOverlay: TextOverlayState;
  loading: boolean;
  resultImage: string | null;
  isGeneratingVariations: boolean;
  isUploadingLogo: boolean;
  isUploadingBg: boolean;
  activeError: string | null;
  errorSuggestion: string | null;
  onSelectProduct: (product: MerchProduct) => void;
  onStyleChange: (style: string) => void;
  onTextOverlayChange: (overlay: TextOverlayState) => void;
  onLogoUpload: (file: File) => void;
  onBgUpload: (file: File) => void;
  onGenerate: () => void;
  onGenerateVariations: () => void;
  onClearLogo: () => void;
  onClearBg: () => void;
  onClearError: () => void;
  onReset: () => void;
}

export const MerchStudioSidebar: React.FC<MerchStudioSidebarProps> = ({
  logoImage, bgImage, selectedProduct, stylePreference, textOverlay,
  loading, resultImage, isGeneratingVariations, isUploadingLogo, isUploadingBg,
  activeError, errorSuggestion,
  onSelectProduct, onStyleChange, onTextOverlayChange,
  onLogoUpload, onBgUpload, onGenerate, onGenerateVariations,
  onClearLogo, onClearBg, onClearError, onReset
}) => {
  const isGenerateDisabled = !logoImage || isUploadingLogo || isUploadingBg || loading;

  return (
    <aside className="lg:col-span-4 xl:col-span-3 flex flex-col h-full min-h-0 bg-slate-900/50 rounded-[2rem] border border-slate-800/40 overflow-hidden shadow-2xl">
      <header className="p-6 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
            <Settings2 className="w-4 h-4 text-blue-500" aria-hidden="true" />
          </div>
          <h2 className="font-black text-slate-200 uppercase tracking-[0.2em] text-[10px]">Studio Pipeline</h2>
        </div>
        <Tooltip content="Reset Studio Session" side="left">
          <button 
            type="button"
            onClick={onReset}
            className="p-2 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/5 transition-all group focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Reset session"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-45 transition-transform" />
          </button>
        </Tooltip>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="grid grid-cols-1 gap-10 animate-fadeIn">
          <StepSection number={1} title="Identity Asset">
            <UploadArea 
              image={logoImage} 
              onFileSelect={onLogoUpload} 
              placeholder="Attach Brand Logo"
              onClear={logoImage ? onClearLogo : undefined}
              loading={isUploadingLogo}
            />
          </StepSection>

          <StepSection number={2} title="Base Product">
            <ProductGrid selectedId={selectedProduct.id} onSelect={onSelectProduct} />
          </StepSection>

          <StepSection number={3} title="Environment">
            <UploadArea 
              image={bgImage}
              onFileSelect={onBgUpload}
              onClear={onClearBg}
              placeholder="Custom Scene (Optional)"
              loading={isUploadingBg}
            />
          </StepSection>

          <StepSection number={4} title="Visual Direction">
            <StyleSelector 
              value={stylePreference} 
              onChange={onStyleChange} 
              productName={selectedProduct.name}
            />
          </StepSection>

          <StepSection number={5} title="Dynamic Typography" badge="Optional">
            <TextOverlayControls 
              overlay={textOverlay}
              onChange={onTextOverlayChange}
              disabled={!logoImage}
            />
          </StepSection>

          {activeError && (
            <div className="space-y-4 pb-4 animate-fadeIn">
              <Alert message={activeError} onDismiss={onClearError} />
              {errorSuggestion && (
                <div className="text-[10px] text-blue-300 bg-blue-500/5 p-5 rounded-2xl border border-blue-500/10 flex gap-4 items-start leading-relaxed shadow-sm" aria-live="polite">
                  <Lightbulb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="font-medium">{errorSuggestion}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <footer className="p-6 bg-slate-900/90 backdrop-blur-2xl border-t border-slate-800 shadow-[0_-15px_30px_rgba(0,0,0,0.4)]">
        <div className={`grid gap-4 ${resultImage && !loading ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <Tooltip content="Synthesize brand mockup using AI" side="top" className="w-full">
            <Button 
              onClick={onGenerate} 
              loading={loading}
              disabled={isGenerateDisabled}
              icon={<Layers className="w-5 h-5" />}
              className="w-full h-14 rounded-2xl shadow-xl shadow-blue-600/10 text-[10px] tracking-widest uppercase font-black"
            >
              {resultImage ? 'Re-Render' : 'Render Pipeline'}
            </Button>
          </Tooltip>

          {resultImage && !loading && (
             <Tooltip content="Generate 3 alternative angles and lighting styles" side="top" className="w-full">
               <Button 
                  variant="indigo"
                  onClick={onGenerateVariations}
                  loading={isGeneratingVariations}
                  icon={<Sparkles className="w-4 h-4" />}
                  className="w-full h-14 rounded-2xl shadow-xl shadow-indigo-600/10 text-[10px] tracking-widest uppercase font-black"
               >
                 Variations
               </Button>
             </Tooltip>
          )}
        </div>
      </footer>
    </aside>
  );
};
