
import React from 'react';
import { Spinner, Button } from '@/shared/components/ui';
import { Image as ImageIcon, Download, AlertCircle, Wand2 } from 'lucide-react';

interface EditorCanvasProps {
  loading: boolean;
  resultImage: string | null;
  error: string | null;
  onRetry: () => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({ loading, resultImage, error, onRetry }) => {
  return (
    <div className={`flex flex-col h-full bg-slate-900 rounded-2xl border overflow-hidden relative transition-colors ${error ? 'border-red-900/30' : 'border-slate-700'}`}>
       {/* Canvas Header */}
       <div className="absolute top-0 left-0 right-0 h-12 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 flex items-center px-4 justify-between z-10">
          <span className="text-slate-400 font-medium flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Result
          </span>
          {resultImage && (
            <a href={resultImage} download={`edited-${Date.now()}.png`} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm font-medium">
              <Download className="w-4 h-4" /> Download
            </a>
          )}
       </div>

       {/* Canvas Body */}
       <div className="flex-1 flex items-center justify-center p-4 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
          {loading ? (
            <div className="text-center">
              <Spinner className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <p className="text-slate-400 animate-pulse font-light">Gemini is processing...</p>
            </div>
          ) : resultImage ? (
            <img src={resultImage} alt="Edited Result" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
          ) : error ? (
            <div className="text-center max-w-sm mx-auto p-6 bg-slate-800/50 rounded-2xl border border-red-900/20 backdrop-blur-sm">
                <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                   <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-slate-200 font-semibold text-lg mb-2">Generation Failed</h3>
                <p className="text-slate-400 text-sm mb-4">{error}</p>
                <Button variant="secondary" onClick={onRetry} className="w-full">Retry</Button>
             </div>
          ) : (
            <div className="text-slate-600 flex flex-col items-center">
              <Wand2 className="w-16 h-16 mb-4 opacity-20" />
              <p className="opacity-50">Upload an image to start</p>
            </div>
          )}
       </div>
    </div>
  );
};
