
import React, { useState, useEffect, useCallback } from 'react';
import { useGenAI } from '@/shared/hooks/useGenAI';
import { Spinner } from '@/shared/components/ui/Spinner';
import { Alert } from '@/shared/components/ui/Alert';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Wand2, Download, Image as ImageIcon, AlertCircle, Eraser } from 'lucide-react';
import { readImageFile, extractImageFile } from '@/shared/utils/file';
import { ImageDropzone } from './ImageDropzone';

interface ImageEditorProps {
  onImageGenerated: (url: string, prompt: string) => void;
}

const QUICK_PROMPTS = ['Add cyberpunk neon lights', 'Turn into a sketch', 'Make it a vector art', 'Pixel art style'];

export const ImageEditor: React.FC<ImageEditorProps> = ({ onImageGenerated }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  
  const { loading, error: apiError, resultImage, generate, clearError: clearApiError, reset } = useGenAI();
  const error = localError || apiError;

  // Clear all error states
  const clearAllErrors = useCallback(() => {
    setLocalError(null);
    clearApiError();
  }, [clearApiError]);

  const processFile = useCallback(async (file: File) => {
    clearAllErrors();
    try {
      const base64 = await readImageFile(file);
      setSelectedImage(base64);
      reset(); // Clear previous generation results
    } catch (err: any) {
      setLocalError(err.message || "Failed to process file.");
    }
  }, [reset, clearAllErrors]);

  // Global Paste Handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const file = extractImageFile(e.clipboardData?.items);
      if (file) {
        e.preventDefault();
        processFile(file);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFile]);

  const handleEdit = async () => {
    if (!selectedImage || !prompt) return;
    const success = await generate(selectedImage, prompt);
    if (success && resultImage) {
        onImageGenerated(resultImage, prompt);
    }
  };

  const handleReset = () => {
      setSelectedImage(null);
      reset();
      clearAllErrors();
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Input / Control Column */}
        <div className="flex flex-col space-y-4">
          <ImageDropzone 
            selectedImage={selectedImage}
            onFileSelect={processFile}
            onReset={handleReset}
            error={error}
          />

          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm">
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Edit Instruction
            </label>
            <div className="flex gap-2">
              <Input
                value={prompt}
                onChange={(e) => { setPrompt(e.target.value); clearAllErrors(); }}
                placeholder="E.g., 'Add a retro filter', 'Remove background'"
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              />
              <Button 
                onClick={handleEdit} 
                loading={loading} 
                loadingText="Wait" 
                disabled={!selectedImage || !prompt}
                icon={<Wand2 className="w-5 h-5" />}
              >
                Go
              </Button>
            </div>
            
            <div className="mt-4 flex flex-col gap-3">
               <div className="flex gap-2">
                  <button
                    onClick={() => { setPrompt('Remove background'); clearAllErrors(); }}
                    className="flex items-center gap-2 text-sm bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-lg border border-indigo-500/20 transition-all w-full sm:w-auto justify-center"
                  >
                    <Eraser className="w-4 h-4" />
                    Remove Background
                  </button>
               </div>

               <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((p) => (
                    <button 
                      key={p}
                      onClick={() => { setPrompt(p); clearAllErrors(); }}
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-full transition-colors border border-slate-600"
                    >
                      {p}
                    </button>
                  ))}
               </div>
            </div>

            {error && <Alert message={error} onDismiss={clearAllErrors} />}
          </div>
        </div>

        {/* Output / Preview Column */}
        <div className={`flex flex-col h-full bg-slate-900 rounded-2xl border overflow-hidden relative transition-colors ${error ? 'border-red-900/30' : 'border-slate-700'}`}>
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
                    <Button variant="secondary" onClick={() => handleEdit()} className="w-full">Retry</Button>
                 </div>
              ) : (
                <div className="text-slate-600 flex flex-col items-center">
                  <Wand2 className="w-16 h-16 mb-4 opacity-20" />
                  <p className="opacity-50">Upload an image to start</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
