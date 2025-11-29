import React, { useState, useRef } from 'react';
import { generateOrEditImage } from '../services/gemini';
import { Spinner } from './ui/Spinner';
import { Upload, Wand2, Download, RefreshCw, Image as ImageIcon, AlertCircle, XCircle } from 'lucide-react';

interface ImageEditorProps {
  onImageGenerated: (url: string, prompt: string) => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ onImageGenerated }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResultImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!selectedImage || !prompt) return;

    setLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const result = await generateOrEditImage(selectedImage, prompt);
      setResultImage(result);
      onImageGenerated(result, prompt);
    } catch (err: any) {
      console.error("Generation error:", err);
      let msg = "An unexpected error occurred.";
      
      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err === 'string') {
        msg = err;
      }

      // Improve user-facing error messages
      if (msg.includes("403") || msg.toLowerCase().includes("api key")) {
        msg = "Access denied. Please verify your API key configuration.";
      } else if (msg.includes("429")) {
        msg = "System is busy (Rate Limit). Please wait a moment before trying again.";
      } else if (msg.toLowerCase().includes("safety")) {
        msg = "The request was blocked by safety filters. Try adjusting your prompt or source image.";
      } else if (msg.toLowerCase().includes("refused")) {
        msg = "The model refused the request. Try a simpler prompt.";
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Input Section */}
        <div className="flex flex-col space-y-4">
          <div 
            className={`flex-1 border-2 border-dashed rounded-2xl bg-slate-800/50 flex flex-col items-center justify-center relative overflow-hidden group transition-colors cursor-pointer ${error ? 'border-red-500/50' : 'border-slate-700 hover:border-blue-500'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedImage ? (
              <img 
                src={selectedImage} 
                alt="Original" 
                className="max-h-full max-w-full object-contain p-4"
              />
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                  <Upload className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-300 font-medium text-lg">Upload Source Image</p>
                <p className="text-slate-500 text-sm mt-2">Click to browse or paste image</p>
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
              <div className="absolute top-2 right-2 bg-black/60 rounded-full p-2 hover:bg-black/80 transition" onClick={(e) => { e.stopPropagation(); setSelectedImage(null); setResultImage(null); setError(null); }}>
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
                onChange={(e) => { setPrompt(e.target.value); if(error) setError(null); }}
                placeholder="E.g., 'Add a retro filter', 'Remove background', 'Make it snowy'"
                className={`flex-1 bg-slate-900 border rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none ${error ? 'border-red-500/50' : 'border-slate-600 focus:border-transparent'}`}
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              />
              <button
                onClick={handleEdit}
                disabled={!selectedImage || !prompt || loading}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
              >
                {loading ? <Spinner /> : <Wand2 className="w-5 h-5" />}
                {loading ? 'Editing...' : 'Generate'}
              </button>
            </div>
            
            {/* Quick Prompts */}
            <div className="mt-4 flex flex-wrap gap-2">
              {['Remove background', 'Add cyberpunk neon lights', 'Turn into a sketch', 'Make it a vector art'].map((p) => (
                <button 
                  key={p}
                  onClick={() => { setPrompt(p); if(error) setError(null); }}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-full transition-colors border border-slate-600"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Inline Error for Left Column */}
            {error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-900/30 rounded-lg flex items-start gap-3 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                   <p className="text-sm text-red-200 font-medium">Generation Failed</p>
                   <p className="text-xs text-red-300/80 mt-1 leading-relaxed">{error}</p>
                </div>
                <button onClick={clearError} className="text-red-400 hover:text-red-300 p-1">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}
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
                    <button 
                      onClick={() => handleEdit()}
                      className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors border border-slate-600"
                    >
                      Try Again
                    </button>
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