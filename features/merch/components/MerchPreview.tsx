
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Spinner, Button, Tooltip, Badge } from '@/shared/components/ui';
import { ShoppingBag, Download, AlertCircle, Lightbulb, Sparkles, Move, Zap } from 'lucide-react';
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
  const textRef = useRef<HTMLDivElement>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const activeImage = viewImage || resultImage;

  const handleExport = async (img: string) => {
    setIsExporting(true);
    const filename = `master-${productId}-${Date.now()}`;
    try {
      await saveImage(img, filename, exportFormat, 2, textOverlay);
    } catch (err) {
      console.error("EXPORT_FAILURE:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleTextDragStart = (e: React.MouseEvent) => {
    if (e.button !== 0 || !textRef.current || !containerRef.current) return;
    e.preventDefault();
    
    const textRect = textRef.current.getBoundingClientRect();
    // Calculate precise click offset within the text element
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
      // Coordinate Clamp: [0-100] percentage range
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
      window.addEventListener('blur', handleTextDragEnd); // Handle window focus loss edge case
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
    <div className="flex flex-col h-full gap-6 p-1">
      <div className="bg-[#05070a] rounded-[3rem] border border-slate-800 p-0.5 relative overflow-hidden flex flex-col flex-1 shadow-inner group/preview">
        <div className="absolute top-8 left-8 z-20 flex flex-wrap items-center gap-3">
          <Badge variant="blue" icon={<Zap className="w-3 h-3" />}>RENDER: {productName}</Badge>
          {stylePreference && <Badge variant="indigo">STYLE: {stylePreference}</Badge>}
        </div>

        <div ref={containerRef} className="flex-1 flex items-center justify-center relative overflow-hidden group/canvas">
          {loading ? (
            <div className="flex flex-col items-center gap-6 animate-fadeIn">
              <Spinner className="w-12 h-12 text-blue-500" />
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Rendering Master...</p>
            </div>
          ) : activeImage ? (
            <div className="relative w-full h-full flex items-center justify-center p-12 select-none group/image">
              <img src={activeImage} alt="Master Render" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-fadeIn" />
              {textOverlay?.text && (
                 <div
                   ref={textRef}
                   onMouseDown={handleTextDragStart}
                   className={`absolute cursor-grab active:cursor-grabbing select-none whitespace-pre-wrap z-30 transition-all ${isDraggingText ? 'scale-105' : ''}`}
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
            <div className="text-center max-w-sm px-10 animate-fadeIn">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-6" />
              <h2 className="text-xl font-black text-white mb-4 uppercase tracking-tighter">System Interrupt</h2>
              <p className="text-slate-500 text-xs mb-8 leading-relaxed font-medium">{error}</p>
            </div>
          ) : (
            <div className="text-center opacity-20">
              <ShoppingBag className="w-24 h-24 mx-auto mb-4" />
              <h2 className="text-xl font-black uppercase tracking-tighter">Viewport Idle</h2>
            </div>
          )}
        </div>

        {activeImage && (
          <div className="p-8 bg-slate-900/50 backdrop-blur-2xl border-t border-slate-800 flex justify-between items-center">
            <Button variant="outline" onClick={onGenerateVariations} loading={isGeneratingVariations} icon={<Sparkles className="w-4 h-4" />}>Matrix Takes</Button>
            <div className="flex gap-4">
              <Button onClick={() => handleExport(activeImage)} loading={isExporting} icon={<Download className="w-4 h-4" />}>Master Export</Button>
            </div>
          </div>
        )}
      </div>
      <MerchVariations variations={variations} isGenerating={isGeneratingVariations} activeImage={activeImage} resultImage={resultImage} onViewImage={setViewImage} />
    </div>
  );
};
