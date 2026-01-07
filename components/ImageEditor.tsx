import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGenAI } from '../hooks/useGenAI';
import { Spinner } from './ui/Spinner';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';
import { Upload, Wand2, Download, RefreshCw, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { readImageFile, extractImageFile } from '../utils/file';
import { logger } from '../shared/utils/logger';

interface ImageEditorProps {
  onImageGenerated: (url: string, prompt: string) => void;
}

const QUICK_PROMPTS = ['Remove background', 'Add cyberpunk neon lights', 'Turn into a sketch', 'Make it a vector art'];

export const ImageEditor: React.FC<ImageEditorProps> = ({ onImageGenerated }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loading, error: apiError, resultImage, generate, clearError: clearApiError, reset } = useGenAI();

  // Combine local validation errors with API errors
  const error = localError || apiError;
  const clearError = () => {
    setLocalError(null);
    clearApiError();
  };

  // Unified file processor
  const processFile = useCallback(async (file: File) => {
    clearError();
    try {
      const base64 = await readImageFile(file);
      setSelectedImage(base64);
      reset(); // Clear previous results
    } catch (err: any) {
      logger.error("File processing error", err);
      setLocalError(err.message || "Failed to process file.");
    }
  }, [reset]);

  // Handle File Input Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Handle Drag Leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Handle Paste (Global)
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

  const handleReset = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedImage(null);
      reset();
      clearError();
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Input Section */}
        <div className="flex flex-col space-y-4">
          <div 
            className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group transition-all cursor-pointer
              ${isDragging 
                ? 'border-blue-500 bg-blue-500/10' 
                : error 
                  ? 'border-red-500/50 bg-slate-800/50' 
                  : 'border-slate-700 bg-slate-800/50 hover:border-blue-500 hover:bg-slate-800'
              }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedImage ? (
              <img 
                src={selectedImage} 
                alt="Original" 
                className="max-h-full max-w-full object-contain p-4"
              />
            ) : (
              <div className="text-center p-6 pointer-events-none">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isDragging ? 'bg-blue-600' : 'bg-slate-700 group-hover:bg-blue-600'}`}>
                  <Upload className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-slate-300'}`} />
                </div>
                <p className="text-slate-300 font-medium text-lg">
                  {isDragging ? 'Drop Image Here' : 'Upload Source Image'}
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Click to browse, drag & drop, or paste (Ctrl+V)
                </p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
            {selectedImage && (
              <div className="absolute top-2 right-2 bg-black/60 rounded-full p-2 hover:bg-black/80 transition z-10" onClick={handleReset}>
                 <RefreshCw className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <label className="block text-sm font-medium text-slate-400 mb-2">
              How would you like to edit this image?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => { setPrompt(e.target.value); clearError(); }}
                placeholder="E.g., 'Add a retro filter', 'Remove background'"
                className={`flex-1 bg-slate-900 border rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none ${error ? 'border-red-500/50' : 'border-slate-600 focus:border-transparent'}`}
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              />
              <Button 
                onClick={handleEdit} 
                loading={loading} 
                loadingText="Editing..." 
                disabled={!selectedImage || !prompt}
                icon={<Wand2 className="w-5 h-5" />}
              >
                Generate
              </Button>
            </div>
            
            {/* Quick Prompts */}
            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button 
                  key={p}
                  onClick={() => { setPrompt(p); clearError(); }}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-full transition-colors border border-slate-600"
                >
                  {p}
                </button>
              ))}
            </div>

            {error && <Alert message={error} onDismiss={clearError} />}
          </div>
        </div>

        {/* Output Section */}
        <div className={`flex flex-col h-full bg-slate-900 rounded-2xl border overflow-hidden relative ${error ? 'border-red-900/30' : 'border-slate-700'}`}>
           <div className="absolute top-0 left-0 right-0 h-12 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 flex items-center px-4 justify-between z-10">
              <span className="text-slate-400 font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Output Result
              </span>
              {resultImage && (
                <a href={resultImage} download={`edited-${Date.now()}.png`} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm font-medium">
                  <Download className="w-4 h-4" /> Save
                </a>
              )}
           </div>

           <div className="flex-1 flex items-center justify-center p-4 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
              {loading ? (
                <div className="text-center">
                  <Spinner className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-slate-400 animate-pulse">Gemini is reimagining your image...</p>
                </div>
              ) : resultImage ? (
                <img src={resultImage} alt="Edited Result" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
              ) : error ? (
                <div className="text-center max-w-sm mx-auto p-6 bg-slate-800/50 rounded-2xl border border-red-900/20 backdrop-blur-sm">
                    <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                       <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-slate-200 font-semibold text-lg mb-2">Oops! Something went wrong</h3>
                    <p className="text-slate-400 text-sm mb-4">{error}</p>
                    <Button variant="secondary" onClick={() => handleEdit()} className="w-full">Try Again</Button>
                 </div>
              ) : (
                <div className="text-slate-600 flex flex-col items-center">
                  <Wand2 className="w-16 h-16 mb-4 opacity-20" />
                  <p>Your creation will appear here</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
