
import React, { Suspense, useState, useCallback, useMemo } from 'react';
import { useMerchController } from '../hooks/useMerchState';
import { Alert, Button, Spinner, Tooltip } from '@/shared/components/ui';
import { StepSection } from './StepSection';
import { Layers, Sparkles, Lightbulb, Box, Image as ImageIcon, Settings2, RotateCcw, LayoutGrid } from 'lucide-react';

// Specialized sub-components
const ProductGrid = React.lazy(() => import('./ProductGrid').then(m => ({ default: m.ProductGrid })));
const UploadArea = React.lazy(() => import('./UploadArea').then(m => ({ default: m.UploadArea })));
const StyleSelector = React.lazy(() => import('./StyleSelector').then(m => ({ default: m.StyleSelector })));
const TextOverlayControls = React.lazy(() => import('./TextOverlayControls').then(m => ({ default: m.TextOverlayControls })));
const MerchPreview = React.lazy(() => import('./MerchPreview').then(m => ({ default: m.MerchPreview })));
const Merch3DViewer = React.lazy(() => import('./Merch3DViewer').then(m => ({ default: m.Merch3DViewer })));

interface MerchStudioProps {
  onImageGenerated: (url: string, prompt: string) => void;
}

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
  const isGenerateDisabled = !logoImage || isUploadingLogo || isUploadingBg || loading;

  const handleReset = useCallback(() => {
    clearLogo();
    clearBg();
    clearActiveError();
  }, [clearLogo, clearBg, clearActiveError]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-0">
      {/* Refactored Configuration Sidebar */}
      <aside className="lg:col-span-4 xl:col-span-3 flex flex-col h-full min-h-0 bg-slate-900/50 rounded-[2rem] border border-slate-800/40 overflow-hidden">
        {/* Sidebar Header: Fixed */}
        <header className="p-6 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
              <Settings2 className="w-4 h-4 text-blue-500" />
            </div>
            <h2 className="font-black text-slate-200 uppercase tracking-[0.2em] text-[10px]">Studio Config</h2>
          </div>
          <Tooltip content="Reset studio session" side="left">
            <button 
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
            >
              <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-45 transition-transform" />
            </button>
          </Tooltip>
        </header>

        {/* Sidebar Content: Scrollable Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="grid grid-cols-1 gap-8 animate-fadeIn">
            <StepSection number={1} title="Identity Asset">
              <Suspense fallback={<div className="h-32 bg-slate-800/30 rounded-2xl animate-pulse" />}>
                <UploadArea 
                  image={logoImage} 
                  onFileSelect={handleLogoUpload} 
                  placeholder="Drop Logo"
                  onClear={logoImage ? clearLogo : undefined}
                  loading={isUploadingLogo}
                />
              </Suspense>
            </StepSection>

            <StepSection number={2} title="Base Product">
              <Suspense fallback={<div className="h-64 bg-slate-800/30 rounded-2xl animate-pulse" />}>
                <ProductGrid selectedId={selectedProduct.id} onSelect={setSelectedProduct} />
              </Suspense>
            </StepSection>

            <StepSection number={3} title="Environment">
              <Suspense fallback={<div className="h-32 bg-slate-800/30 rounded-2xl animate-pulse" />}>
                <UploadArea 
                  image={bgImage}
                  onFileSelect={handleBgUpload}
                  onClear={clearBg}
                  placeholder="Custom Scene"
                  loading={isUploadingBg}
                />
              </Suspense>
            </StepSection>

            <StepSection number={4} title="Visual Direction">
              <Suspense fallback={<div className="h-24 bg-slate-800/30 rounded-2xl animate-pulse" />}>
                <StyleSelector 
                  value={stylePreference} 
                  onChange={setStylePreference} 
                  productName={selectedProduct.name}
                />
              </Suspense>
            </StepSection>

            <StepSection number={5} title="Post-Render Annotations">
              <Suspense fallback={<div className="h-20 bg-slate-800/30 rounded-2xl animate-pulse" />}>
                <TextOverlayControls 
                  overlay={textOverlay}
                  onChange={setTextOverlay}
                  disabled={!resultImage && viewMode === '2D'}
                />
              </Suspense>
            </StepSection>

            {activeError && (
              <div className="space-y-3 pb-2">
                <Alert message={activeError} onDismiss={clearActiveError} />
                {errorSuggestion && (
                  <div className="text-[10px] text-blue-300 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10 flex gap-3 items-start leading-relaxed">
                    <Lightbulb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>{errorSuggestion}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Command Hub: Fixed Bottom */}
        <footer className="p-6 bg-slate-900/80 backdrop-blur-2xl border-t border-slate-800/60 shadow-[0_-20px_40px_rgba(0,0,0,0.3)]">
          <div className="grid grid-cols-1 gap-3">
            <Tooltip content="Synthesize brand mockup" side="top" className="w-full">
              <Button 
                onClick={handleGenerate} 
                loading={loading}
                disabled={isGenerateDisabled}
                icon={<Layers className="w-5 h-5" />}
                className="w-full h-14 rounded-2xl shadow-2xl shadow-blue-500/10"
              >
                Render High-Fi
              </Button>
            </Tooltip>

            {resultImage && !loading && (
               <Tooltip content="Explore alternate camera takes" side="top" className="w-full">
                 <Button 
                    variant="outline"
                    onClick={handleGenerateVariations}
                    loading={isGeneratingVariations}
                    icon={<Sparkles className="w-4 h-4 text-blue-400" />}
                    className="w-full h-12 rounded-2xl border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-300 font-bold"
                 >
                   Alternative Takes
                 </Button>
               </Tooltip>
            )}
          </div>
        </footer>
      </aside>

      {/* Main Workspace: Render Pipeline */}
      <main className="lg:col-span-8 xl:col-span-9 flex flex-col h-full min-h-0 animate-fadeIn">
         <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white flex items-center gap-4 tracking-tighter uppercase">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-blue-500" />
                </div>
                Viewport
                {loading && <Spinner className="w-6 h-6 text-blue-500 ml-2" />}
              </h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] pl-14">
                Active Session: <span className="text-blue-400">{selectedProduct.name}</span>
              </p>
            </div>
            
            <div className="bg-slate-900/50 p-1.5 rounded-2xl flex border border-slate-800 shadow-2xl backdrop-blur-xl self-stretch sm:self-auto">
               <Tooltip content="AI Render Pipeline">
                 <button
                    onClick={() => setViewMode('2D')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${viewMode === '2D' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                 >
                    <ImageIcon className="w-4 h-4" />
                    2D MASTER
                 </button>
               </Tooltip>
               <Tooltip content="Interactive 3D Engine">
                 <button
                    onClick={() => setViewMode('3D')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${viewMode === '3D' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                    disabled={!logoImage}
                 >
                    <Box className="w-4 h-4" />
                    3D INSPECT
                 </button>
               </Tooltip>
            </div>
         </header>

         <section className="flex-1 bg-slate-900/50 rounded-[3rem] border border-slate-800/40 overflow-hidden relative shadow-2xl min-h-0">
           <Suspense fallback={
              <div className="h-full flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Loading Workspace...</p>
              </div>
           }>
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
                   <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-8 px-12 text-center">
                      <div className="w-40 h-40 bg-slate-800/20 rounded-[2.5rem] flex items-center justify-center border border-slate-800 shadow-inner group transition-all">
                        <Box className="w-20 h-20 opacity-10 group-hover:opacity-20 transition-opacity" />
                      </div>
                      <div className="max-w-xs space-y-4">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">3D Simulation Offline</h3>
                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                          Attach a brand asset to synchronize the 3D pipeline
                        </p>
                      </div>
                   </div>
                )
             )}
           </Suspense>
         </section>
      </main>
    </div>
  );
};
