import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Spinner, Button, Tooltip, Badge } from '@/shared/components/ui';
import { ShoppingBag, Download, AlertCircle, Sparkles, Zap, Sliders, Layers, FileDown, Image as ImageIcon } from 'lucide-react';
import { saveImage, ExportFormat } from '@/shared/utils/image';
import { MerchVariations } from './MerchVariations';
import { TextOverlayState } from '../hooks/useMerchState';
import { logger } from '@/shared/utils/logger';

interface MerchPreviewProps {
  logoImage: string | null;
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
  logoImage,
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
  const [jpgQuality, setJpgQuality] = useState(90);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{current: number, total: number} | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const activeImage = viewImage || resultImage;

  const handleExport = async (img: string, label: string = 'master') => {
    setIsExporting(true);
    const filename = `${label}-${productId}-${Date.now()}`;
    try {
      await saveImage(img, filename, exportFormat, 2, textOverlay, jpgQuality / 100);
    } catch (err) {
      logger.error("EXPORT_FAILURE", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAllVariations = async () => {
    if (variations.length === 0) return;
    setIsExporting(true);
    setExportProgress({ current: 0, total: variations.length });
    
    try {
      for (let i = 0; i < variations.length; i++) {
        setExportProgress({ current: i + 1, total: variations.length });
        await saveImage(variations[i], `variation-${i+1}-${productId}`, exportFormat, 2, textOverlay, jpgQuality / 100);
        await new Promise(r => setTimeout(r, 400));
      }
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(null), 2000);
    }
  };

  const handleTextDragStart = (e: React.MouseEvent) => {
    if (e.button !== 0 || !textRef.current || !containerRef.current) return;
    e.preventDefault();
    
    const textRect = textRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - textRect.left - (textRect.width / 2),
      y: e.clientY - textRect.top - (textRect.height / 2)
    });
    
    setIsDraggingText(true);
    document.body.style.cursor = 'grabbing';
  };

  const handleTextDragMove = useCallback((e: MouseEvent) => {
    if (!isDraggingText || !containerRef.current || !onTextOverlayChange || !textOverlay) return;
    if (rafRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    rafRef.current = requestAnimationFrame(() => {
      const x = ((e.clientX - dragOffset.x - rect.left) / rect.width) * 100;
      const y = ((e.clientY - dragOffset.y - rect.top) / rect.height) * 100;
      
      onTextOverlayChange({
        ...textOverlay,
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y))
      });
      rafRef.current = null;
    });
  }, [isDraggingText, onTextOverlayChange, textOverlay, dragOffset]);

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
      window.addEventListener('blur', handleTextDragEnd);
    } else {
      window.removeEventListener('mousemove', handleTextDragMove);
      window.removeEventListener('mouseup', handleTextDragEnd);
      window.removeEventListener('blur', handleTextDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleTextDragMove);
      window.removeEventListener('mouseup', handleTextDragEnd);
      window.removeEventListener('blur', handleTextDragEnd);
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
    return {
      backgroundColor: hex,
      opacity: opacity,
      padding: `${textOverlay.bgPadding ?? 16}px`,
      borderRadius: `${textOverlay.bgRounding ?? 8}px`,
    };
  };

  return (
    <div className="flex flex-col h-full gap-8 p-1">
      <div className="bg-[#05070a] rounded-[3rem] border border-slate-800 p-0.5 relative overflow-hidden flex flex-col flex-1 shadow-inner group/preview">
        {/* Top Status Bar */}
        <div className="absolute top-8 left-8 right-8 z-20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Badge variant="blue" icon={<Zap className="w-3 h-3" />}>RENDER: {productName}</Badge>
            {stylePreference && <Badge variant="indigo">STYLE: {stylePreference}</Badge>}
            {exportProgress && (
              <Badge variant="success" icon={<FileDown className="w-3 h-3 animate-bounce" />}>
                EXPORTING: {exportProgress.current}/{exportProgress.total}
              </Badge>
            )}
          </div>
          
          <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">2D Synthesis View</span>
          </div>
        </div>

        <div ref={containerRef} className="flex-1 flex items-center justify-center relative overflow-hidden group/canvas">
          {loading ? (
            <div className="flex flex-col items-center gap-6 animate-fadeIn" aria-live="polite">
              <Spinner className="w-12 h-12 text-blue-500" />
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Rendering Master...</p>
            </div>
          ) : activeImage ? (
            <div className="relative w-full h-full flex items-center justify-center p-12 select-none group/image">
              <img src={activeImage} alt="Mockup preview" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-fadeIn" />
              {textOverlay?.text && (
                 <div
                   ref={textRef}
                   onMouseDown={handleTextDragStart}
                   className={`absolute cursor-grab active:cursor-grabbing select-none whitespace-pre-wrap z-30 transition-all focus:ring-2 focus:ring-blue-500 rounded px-1 ${isDraggingText ? 'scale-105' : ''}`}
                   style={{
                     left: `${textOverlay.x}%`,
                     top: `${textOverlay.y}%`,
                     transform: getTransform(textOverlay.align, textOverlay.rotation),
                     fontFamily: textOverlay.font,
                     fontSize: `${textOverlay.size}px`,
                     color: textOverlay.color,
                     textAlign: textOverlay.align,
                     opacity: (textOverlay.opacity ?? 100) / 100,
                     ...getBgStyle()
                   }}
                 >
                   {textOverlay.text}
                 </div>
              )}
            </div>
          ) : error ? (
            <div className="text-center max-w-sm px-10 animate-fadeIn" role="alert">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-6" aria-hidden="true" />
              <h2 className="text-xl font-black text-white mb-4 uppercase tracking-tighter">System Interrupt</h2>
              <p className="text-slate-500 text-xs mb-8 leading-relaxed font-medium">{error}</p>
              {errorSuggestion && (
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                  {errorSuggestion}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center opacity-20">
              <ShoppingBag className="w-24 h-24 mx-auto mb-4" aria-hidden="true" />
              <h2 className="text-xl font-black uppercase tracking-tighter">Viewport Idle</h2>
            </div>
          )}
        </div>

        {activeImage && (
          <div className="p-8 bg-slate-900/50 backdrop-blur-2xl border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-2xl border border-slate-700">
              <div className="flex gap-1 p-1 bg-slate-900 rounded-xl">
                {(['png', 'jpg', 'webp'] as ExportFormat[]).map(fmt => (
                  <Tooltip key={fmt} content={`Export result in ${fmt.toUpperCase()} format ${fmt === 'png' ? '(lossless, supports transparency)' : '(compressed, optimized for web)'}`}>
                    <button
                      onClick={() => setExportFormat(fmt)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${exportFormat === fmt ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {fmt}
                    </button>
                  </Tooltip>
                ))}
              </div>
              {exportFormat !== 'png' && (
                <div className="flex items-center gap-3 px-2 border-l border-slate-700">
                  <Tooltip content="Adjust export quality vs file size balance. Lower values result in smaller files but visible artifacts.">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-slate-500" />
                      <input 
                        type="range" min="10" max="100" value={jpgQuality} 
                        onChange={(e) => setJpgQuality(parseInt(e.target.value))}
                        className="w-20 accent-blue-600 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-blue-400 font-black min-w-[2.5rem]">{jpgQuality}%</span>
                    </div>
                  </Tooltip>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Tooltip content="Generate alternative mockup variations with different lighting and angles based on your design" side="top">
                <Button variant="outline" onClick={onGenerateVariations} loading={isGeneratingVariations} icon={<Sparkles className="w-4 h-4" />}>Variations</Button>
              </Tooltip>
              {variations.length > 0 && (
                <Tooltip content="Batch export all generated variations at once in the selected format" side="top">
                  <Button variant="secondary" onClick={handleExportAllVariations} loading={isExporting && !!exportProgress} icon={<Layers className="w-4 h-4" />}>Export All</Button>
                </Tooltip>
              )}
              <Tooltip content="Download current master mockup at high resolution (2x upscale)" side="top">
                <Button onClick={() => handleExport(activeImage)} loading={isExporting && !exportProgress} icon={<Download className="w-4 h-4" />}>Export</Button>
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
        onGenerate={onGenerateVariations}
        disabled={loading}
      />
    </div>
  );
};