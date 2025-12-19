
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Spinner, Button, Tooltip } from '@/shared/components/ui';
import { ShoppingBag, Download, AlertCircle, Lightbulb, Sparkles, ChevronLeft, ChevronRight, Move } from 'lucide-react';
import { saveImage, ExportFormat } from '@/shared/utils/image';
import { MerchVariations } from './MerchVariations';
import { TextOverlayState } from '../hooks/useMerchState';

interface MerchPreviewProps {
  loading: boolean;
  resultImage: string | null;
  variations: string[];
  isGeneratingVariations: boolean;
  onGenerateVariations: () => void;
  error: string | null;
  errorSuggestion: string | null;
  productName: string;
  stylePreference: string;
  productId: string;
  textOverlay?: TextOverlayState;
  onTextOverlayChange?: (overlay: TextOverlayState) => void;
}

export const MerchPreview: React.FC<MerchPreviewProps> = ({
  loading,
  resultImage,
  variations,
  isGeneratingVariations,
  onGenerateVariations,
  error,
  errorSuggestion,
  productName,
  stylePreference,
  productId,
  textOverlay,
  onTextOverlayChange
}) => {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const rafRef = useRef<number | null>(null);

  const activeImage = viewImage || resultImage;

  const handleExport = async (img: string) => {
    setIsExporting(true);
    const filename = `merch-${productId}-${Date.now()}`;
    try {
      await saveImage(img, filename, exportFormat, 2, textOverlay);
    } catch (err) {
      console.error(err);
      alert("Failed to export image. Check console for details.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleTextDragStart = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setIsDraggingText(true);
    document.body.style.cursor = 'grabbing';
  };

  const handleTextDragMove = useCallback((e: MouseEvent) => {
    if (!isDraggingText || !containerRef.current || !onTextOverlayChange || !textOverlay) return;
    
    if (rafRef.current) return;

    const clientX = e.clientX;
    const clientY = e.clientY;
    const rect = containerRef.current.getBoundingClientRect();

    rafRef.current = requestAnimationFrame(() => {
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      
      onTextOverlayChange({
        ...textOverlay,
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y))
      });
      rafRef.current = null;
    });
  }, [isDraggingText, onTextOverlayChange, textOverlay]);

  const handleTextDragEnd = useCallback(() => {
    setIsDraggingText(false);
    document.body.style.cursor = '';
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isDraggingText) {
      window.addEventListener('mousemove', handleTextDragMove);
      window.addEventListener('mouseup', handleTextDragEnd);
    } else {
      window.removeEventListener('mousemove', handleTextDragMove);
      window.removeEventListener('mouseup', handleTextDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleTextDragMove);
      window.removeEventListener('mouseup', handleTextDragEnd);
    };
  }, [isDraggingText, handleTextDragMove, handleTextDragEnd]);

  const getTransform = (align: string = 'center', rotation: number = 0) => {
    let xOffset = '-50%';
    if (align === 'left') xOffset = '0%';
    if (align === 'right') xOffset = '-100%';
    
    return `translate(${xOffset}, -50%) rotate(${rotation}deg)`;
  };

  const getBgStyle = () => {
    if (!textOverlay?.bgEnabled) return {};
    
    const hex = textOverlay.bgColor;
    const opacity = (textOverlay.bgOpacity ?? 50) / 100;
    
    // Convert hex to rgba
    let r = 0, g = 0, b = 0;
    if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }

    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity})`,
      padding: `${textOverlay.bgPadding ?? 16}px`,
      borderRadius: `${textOverlay.bgRounding ?? 8}px`,
    };
  };

  return (
    <div 
      className="flex flex-col h-full gap-6 p-1"
      role="region"
      aria-label="Merch Preview Workspace"
    >
      <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-0.5 relative overflow-hidden flex flex-col flex-1 shadow-2xl">
        {/* Dynamic Context Overlays */}
        <div className="absolute top-6 left-6 z-20 flex flex-wrap items-center gap-2">
          <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-[0.25em] text-white shadow-2xl">
            {productName}
          </div>
          {stylePreference && (
            <div className="bg-blue-600/30 backdrop-blur-xl px-4 py-2 rounded-full border border-blue-500/30 text-[9px] font-black uppercase tracking-[0.25em] text-blue-400 shadow-2xl">
              {stylePreference}
            </div>
          )}
        </div>

        <div 
           ref={containerRef}
           className="flex-1 flex items-center justify-center bg-[#070b14] relative overflow-hidden group/canvas"
        >
          {loading ? (
            <div className="flex flex-col items-center gap-8 animate-pulse">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse" />
                <Spinner className="w-20 h-20 text-blue-500 relative" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-2xl text-white font-black tracking-tight uppercase">Rendering Mockup</p>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] max-w-[200px] mx-auto leading-relaxed">
                  Synthesizing lighting for {productName}
                </p>
              </div>
            </div>
          ) : activeImage ? (
            <div className="relative w-full h-full flex items-center justify-center p-12 select-none group/image">
              <img 
                src={activeImage} 
                alt={`${productName} mockup`}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_50px_120px_rgba(0,0,0,0.9)] animate-fadeIn transition-all duration-700" 
              />
              
              {/* Floating Text Component */}
              {textOverlay && textOverlay.text && (
                 <div
                   onMouseDown={handleTextDragStart}
                   className={`
                    absolute cursor-grab active:cursor-grabbing select-none whitespace-pre-wrap z-30 transition-all 
                    ${isDraggingText ? 'ring-2 ring-blue-500 rounded-lg p-2 bg-blue-500/10 scale-105' : 'hover:ring-1 hover:ring-white/30 rounded p-1'}
                   `}
                   style={{
                     left: `${textOverlay.x}%`,
                     top: `${textOverlay.y}%`,
                     transform: getTransform(textOverlay.align, textOverlay.rotation),
                     fontFamily: textOverlay.font,
                     fontSize: `${textOverlay.size}px`,
                     color: textOverlay.color,
                     textShadow: textOverlay.bgEnabled ? 'none' : '0 4px 20px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.4)',
                     textAlign: textOverlay.align,
                     opacity: (textOverlay.opacity !== undefined ? textOverlay.opacity : 100) / 100,
                     lineHeight: '1.2',
                     transformOrigin: 'center center',
                     ...getBgStyle()
                   }}
                 >
                   {textOverlay.text}
                   
                   {/* Drag Handle Indicator (Visible on Hover) */}
                   {!isDraggingText && (
                     <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/image:opacity-100 transition-opacity bg-blue-600 text-white p-1 rounded-full shadow-lg">
                       <Move className="w-3 h-3" />
                     </div>
                   )}
                 </div>
              )}
            </div>
          ) : error ? (
            <div className="text-center max-w-md px-12 animate-fadeIn">
              <div className="bg-red-500/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-red-500/20 shadow-[0_0_80px_rgba(239,68,68,0.15)] rotate-3">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">System Interrupt</h2>
              <p className="text-slate-400 font-medium mb-10 leading-relaxed text-sm">{error}</p>
              {errorSuggestion && (
                 <div className="bg-slate-800/80 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-6 text-left flex gap-5 shadow-2xl ring-1 ring-white/5">
                   <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                     <Lightbulb className="w-6 h-6 text-amber-500" />
                   </div>
                   <div>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Proposed Fix</span>
                     <p className="text-xs text-slate-300 font-bold leading-relaxed">{errorSuggestion}</p>
                   </div>
                 </div>
              )}
            </div>
          ) : (
            <div className="text-center group select-none animate-fadeIn">
              <div className="relative mb-10">
                <div className="absolute inset-0 bg-blue-500 blur-[120px] opacity-10 animate-pulse" />
                <div className="w-40 h-40 bg-slate-800/30 rounded-full border border-white/5 flex items-center justify-center backdrop-blur-sm relative group-hover:scale-110 transition-transform duration-700">
                  <ShoppingBag className="w-16 h-16 text-slate-700 transition-colors duration-700 group-hover:text-blue-500/40" />
                </div>
              </div>
              <h2 className="text-4xl font-black text-slate-700 uppercase tracking-tighter mb-3 group-hover:text-slate-500 transition-colors">Studio Idle</h2>
              <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-[10px]">Awaiting render parameters</p>
            </div>
          )}
        </div>

        {activeImage && (
          <div className="p-8 bg-slate-900/80 backdrop-blur-3xl border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-5">
               {!loading && !isGeneratingVariations && (
                 <Tooltip content="Request alternative camera angles and environments">
                   <button
                     onClick={onGenerateVariations}
                     className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-6 py-3 rounded-2xl transition-all shadow-xl active:scale-95 group"
                   >
                     <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" /> 
                     {variations.length > 0 ? 'Reshuffle takes' : 'Render Multi-Takes'}
                   </button>
                 </Tooltip>
               )}
            </div>

            <div className="flex items-center gap-5">
              <div className="flex items-center bg-slate-950/80 rounded-2xl p-1.5 border border-slate-800 shadow-inner">
                {['png', 'jpg'].map(fmt => (
                  <Tooltip key={fmt} content={`Set export format to ${fmt.toUpperCase()}`}>
                    <button
                      onClick={() => setExportFormat(fmt as ExportFormat)}
                      className={`px-5 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all ${exportFormat === fmt ? 'bg-slate-800 text-white shadow-xl ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  </Tooltip>
                ))}
              </div>

              <Tooltip content="Export high-fidelity master for production" side="left">
                <Button
                  onClick={() => handleExport(activeImage)}
                  loading={isExporting}
                  loadingText="Exporting..."
                  className="py-3.5 h-auto text-[11px] px-10 shadow-2xl shadow-blue-600/20 uppercase tracking-[0.2em]"
                  variant="indigo"
                  icon={<Download className="w-4 h-4" />}
                >
                  Download Master
                </Button>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
      
      <MerchVariations 
        variations={variations}
        isGenerating={isGeneratingVariations}
        activeImage={activeImage}
        resultImage={resultImage}
        onViewImage={setViewImage}
      />
    </div>
  );
};
