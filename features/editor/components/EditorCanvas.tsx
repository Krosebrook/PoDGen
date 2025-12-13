
import React, { useEffect } from 'react';
import { Spinner, Button, Tooltip } from '@/shared/components/ui';
import { Image as ImageIcon, Download, AlertCircle, Wand2, ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';
import { useCanvasTransform } from '../hooks/useCanvasTransform';

interface EditorCanvasProps {
  loading: boolean;
  resultImage: string | null;
  error: string | null;
  onRetry: () => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({ loading, resultImage, error, onRetry }) => {
  const {
    scale,
    position,
    isDragging,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    reset
  } = useCanvasTransform();

  // Reset zoom when image changes
  useEffect(() => {
    if (resultImage) {
      reset();
    }
  }, [resultImage, reset]);

  return (
    <div className={`flex flex-col h-full bg-slate-900 rounded-2xl border overflow-hidden relative transition-colors ${error ? 'border-red-900/30' : 'border-slate-700'}`}>
       {/* Canvas Header */}
       <div className="absolute top-0 left-0 right-0 h-12 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 flex items-center px-4 justify-between z-10">
          <span className="text-slate-400 font-medium flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Result
          </span>
          {resultImage && (
            <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
                    <Move className="w-3 h-3" />
                    <span className="hidden sm:inline">Drag to Pan</span>
                 </div>
                 <a href={resultImage} download={`edited-${Date.now()}.png`} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm font-medium">
                   <Download className="w-4 h-4" /> Save
                 </a>
            </div>
          )}
       </div>

       {/* Canvas Body */}
       <div 
         className={`flex-1 w-full h-full overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5 relative
            ${resultImage ? 'cursor-move' : ''}
         `}
         onMouseDown={resultImage ? handleMouseDown : undefined}
         onMouseMove={resultImage ? handleMouseMove : undefined}
         onMouseUp={resultImage ? handleMouseUp : undefined}
         onMouseLeave={resultImage ? handleMouseUp : undefined}
         onWheel={resultImage ? handleWheel : undefined}
       >
          <div className="w-full h-full flex items-center justify-center">
             {loading ? (
                <div className="text-center pointer-events-none select-none">
                  <Spinner className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-slate-400 animate-pulse font-light">Gemini is processing...</p>
                </div>
              ) : resultImage ? (
                <div 
                    className="transition-transform duration-75 ease-out w-full h-full flex items-center justify-center p-4 will-change-transform"
                    style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
                >
                    <img 
                        src={resultImage} 
                        alt="Edited Result" 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl pointer-events-none select-none" 
                    />
                </div>
              ) : error ? (
                <div className="text-center max-w-sm mx-auto p-6 bg-slate-800/50 rounded-2xl border border-red-900/20 backdrop-blur-sm relative z-20">
                    <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                       <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-slate-200 font-semibold text-lg mb-2">Generation Failed</h3>
                    <p className="text-slate-400 text-sm mb-4">{error}</p>
                    <Button variant="secondary" onClick={onRetry} className="w-full">Retry</Button>
                 </div>
              ) : (
                <div className="text-slate-600 flex flex-col items-center select-none pointer-events-none">
                  <Wand2 className="w-16 h-16 mb-4 opacity-20" />
                  <p className="opacity-50">Upload an image to start</p>
                </div>
              )}
          </div>

          {/* Zoom Controls Overlay */}
          {resultImage && !loading && (
             <div 
               className="absolute bottom-4 right-4 flex items-center gap-2 bg-slate-800/90 backdrop-blur border border-slate-700 p-1.5 rounded-lg shadow-xl z-20"
               onMouseDown={(e) => e.stopPropagation()} // Prevent dragging when clicking controls
             >
                <Tooltip content="Zoom Out">
                    <button onClick={handleZoomOut} className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors">
                        <ZoomOut className="w-4 h-4" />
                    </button>
                </Tooltip>
                <span className="text-xs font-mono text-slate-400 min-w-[3rem] text-center select-none">{Math.round(scale * 100)}%</span>
                <Tooltip content="Zoom In">
                    <button onClick={handleZoomIn} className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors">
                        <ZoomIn className="w-4 h-4" />
                    </button>
                </Tooltip>
                <div className="w-px h-4 bg-slate-700 mx-1" />
                <Tooltip content="Reset View">
                    <button onClick={handleReset} className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors">
                        <Maximize className="w-4 h-4" />
                    </button>
                </Tooltip>
             </div>
          )}
       </div>
    </div>
  );
};
