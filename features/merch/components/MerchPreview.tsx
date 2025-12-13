
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Spinner, Button, Tooltip } from '@/shared/components/ui';
import { ShoppingBag, Download, AlertCircle, Lightbulb, Sparkles } from 'lucide-react';
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

  // Determine which image to show prominently (viewImage override, or resultImage)
  const activeImage = viewImage || resultImage;

  const handleExport = async (img: string) => {
    setIsExporting(true);
    const filename = `merch-${productId}-${Date.now()}`;
    try {
      await saveImage(img, filename, exportFormat, 1, textOverlay);
    } catch (err) {
      console.error(err);
      alert("Failed to export image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleTextDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingText(true);
  };

  const handleTextDragMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingText || !containerRef.current || !onTextOverlayChange || !textOverlay) return;
    
    // Throttle via RAF
    if (rafRef.current) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    rafRef.current = requestAnimationFrame(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;
        
        onTextOverlayChange({
          ...textOverlay,
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y))
        });
      }
      rafRef.current = null;
    });
  }, [isDraggingText, onTextOverlayChange, textOverlay]);

  const handleTextDragEnd = () => {
    setIsDraggingText(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const getTransform = (align: string = 'center') => {
    switch (align) {
      case 'left': return 'translate(0, -50%)'; // Anchor is left-center
      case 'right': return 'translate(-100%, -50%)'; // Anchor is right-center
      default: return 'translate(-50%, -50%)'; // Anchor is center-center
    }
  };

  return (
    <div 
      className="flex flex-col h-full gap-4"
      onMouseMove={handleTextDragMove}
      onMouseUp={handleTextDragEnd}
      onMouseLeave={handleTextDragEnd}
    >
      {/* Main Preview Area */}
      <div className="bg-slate-900 rounded-2xl border border-slate-700 p-1 relative overflow-hidden flex flex-col flex-1 min-h-[400px]">
        <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-medium text-white flex items-center gap-2">
          <span>{productName} Preview</span>
          {stylePreference && <span className="text-slate-400 border-l border-white/20 pl-2">{stylePreference}</span>}
        </div>

        <div 
           ref={containerRef}
           className="flex-1 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950 relative overflow-hidden"
        >
          {loading ? (
            <div className="flex flex-col items-center">
              <Spinner className="w-16 h-16 text-indigo-500 mb-6" />
              <p className="text-xl text-slate-300 font-light tracking-wide animate-pulse">Designing your {productName}...</p>
            </div>
          ) : activeImage ? (
            <div className="relative max-w-full max-h-full flex items-center justify-center">
              <img src={activeImage} alt="Merch Mockup" className="max-w-full max-h-full object-contain rounded shadow-2xl animate-fadeIn" />
              
              {/* Text Overlay Layer */}
              {textOverlay && textOverlay.text && (
                 <div
                   onMouseDown={handleTextDragStart}
                   className={`absolute cursor-move select-none whitespace-pre-wrap z-20 ${isDraggingText ? 'opacity-80' : ''}`}
                   style={{
                     left: `${textOverlay.x}%`,
                     top: `${textOverlay.y}%`,
                     transform: `${getTransform(textOverlay.align)} rotate(${textOverlay.rotation || 0}deg)`,
                     fontFamily: textOverlay.font,
                     fontSize: `${textOverlay.size}px`,
                     color: textOverlay.color,
                     textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                     textAlign: textOverlay.align,
                     opacity: (textOverlay.opacity !== undefined ? textOverlay.opacity : 100) / 100,
                     lineHeight: '1.2'
                   }}
                 >
                   {textOverlay.text}
                   {/* Hover Border for visual feedback */}
                   <div className="absolute inset-[-4px] border border-transparent hover:border-blue-400/50 rounded pointer-events-none transition-colors" />
                 </div>
              )}
            </div>
          ) : error ? (
            <div className="text-center opacity-90 max-w-md px-6 animate-fadeIn">
              <div className="bg-red-500/10 p-6 rounded-full inline-block mb-4">
                <AlertCircle className="w-12 h-12 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-red-400">Generation Failed</h2>
              <p className="text-slate-400 mt-2 mb-4">{error}</p>
              {errorSuggestion && (
                 <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-left flex gap-3">
                   <Lightbulb className="w-5 h-5 text-yellow-500 shrink-0" />
                   <div>
                     <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Suggestion</span>
                     <p className="text-sm text-slate-400 mt-1">{errorSuggestion}</p>
                   </div>
                 </div>
              )}
            </div>
          ) : (
            <div className="text-center opacity-30">
              <ShoppingBag className="w-32 h-32 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Ready to Design</h2>
              <p>Upload a logo and select a product to begin</p>
            </div>
          )}
        </div>

        {/* Toolbar */}
        {activeImage && (
          <div className="p-4 bg-slate-800 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
               {/* Generate Variations Button */}
               {!loading && !isGeneratingVariations && (
                 <Tooltip content={variations.length > 0 ? "Regenerate variations" : "Create 3 unique AI variations"} side="top">
                   <button
                     onClick={onGenerateVariations}
                     className="text-xs flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-full transition-all"
                   >
                     <Sparkles className="w-3 h-3" /> 
                     {variations.length > 0 ? 'Regenerate Variations' : 'Generate 3 Variations'}
                   </button>
                 </Tooltip>
               )}
            </div>

            <div className="flex items-center gap-3">
              {/* Format Controls */}
              <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700 hidden sm:flex">
                <Tooltip content="Set export format to PNG">
                  <button
                    onClick={() => setExportFormat('png')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${exportFormat === 'png' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >PNG</button>
                </Tooltip>
                <div className="w-px h-4 bg-slate-700 mx-1"></div>
                <Tooltip content="Set export format to JPG">
                  <button
                    onClick={() => setExportFormat('jpg')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${exportFormat === 'jpg' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >JPG</button>
                </Tooltip>
              </div>

              <Tooltip content="Save high-quality image" side="left">
                <Button
                  onClick={() => handleExport(activeImage)}
                  loading={isExporting}
                  loadingText="Saving..."
                  className="py-2 h-auto text-sm"
                  icon={<Download className="w-4 h-4" />}
                >
                  Export
                </Button>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
      
      {/* Variations Strip (Extracted) */}
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
