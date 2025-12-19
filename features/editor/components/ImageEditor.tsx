
import React, { Suspense } from 'react';
import { useEditorState } from '../hooks/useEditorState';
import { ImageDropzone } from './ImageDropzone';
import { EditorToolbar } from './EditorToolbar';
import { EditorCanvas } from './EditorCanvas';
import { Button, Card } from '@/shared/components/ui';
import { Wand2, Search, ExternalLink, FileSearch, Sparkles, Brain } from 'lucide-react';

interface ImageEditorProps {
  onImageGenerated: (url: string, prompt: string) => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ onImageGenerated }) => {
  const {
    model, handleModelChange,
    aspectRatio, setAspectRatio,
    imageSize, setImageSize,
    useSearch, setUseSearch,
    useThinking, setUseThinking,
    isProKeySelected,
    selectedImage,
    prompt, setPrompt,
    resultImage,
    analysisResult,
    groundingSources,
    loading,
    error,
    processFile,
    handleGenerate,
    handleAnalyze,
    handleReset,
    clearAllErrors
  } = useEditorState(onImageGenerated);

  return (
    <div className="flex flex-col h-full space-y-6 animate-fadeIn">
      {/* Dynamic AI Configuration Strip */}
      <EditorToolbar 
        model={model} 
        onModelChange={handleModelChange}
        aspectRatio={aspectRatio} 
        onAspectRatioChange={setAspectRatio}
        imageSize={imageSize} 
        onImageSizeChange={setImageSize}
        useSearch={useSearch} 
        onSearchToggle={setUseSearch}
        useThinking={useThinking} 
        onThinkingToggle={setUseThinking}
        isPro={isProKeySelected}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        {/* Workspace Controls */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          <ImageDropzone 
            selectedImage={selectedImage}
            onFileSelect={processFile}
            onReset={handleReset}
            error={error}
          />

          <Card className="shadow-xl bg-slate-800/50 border-slate-700">
            <header className="mb-4 flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Creative Instructions
              </label>
              {useThinking && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-bold">
                  <Brain className="w-2.5 h-2.5" /> DEEP REASONING
                </div>
              )}
            </header>
            
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g. 'Integrate a sci-fi HUD over the eyes' or 'Place this product on a neon street in Tokyo'"
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[140px] transition-all text-sm leading-relaxed"
              />
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleGenerate} 
                  loading={loading}
                  disabled={!prompt || loading}
                  className="flex-1 shadow-lg shadow-blue-500/10"
                  icon={<Wand2 className="w-5 h-5" />}
                >
                  Apply AI Edit
                </Button>
                {selectedImage && (
                  <Button 
                    variant="secondary"
                    onClick={handleAnalyze} 
                    loading={loading}
                    disabled={loading}
                    icon={<FileSearch className="w-5 h-5" />}
                  >
                    Contextual Analysis
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {analysisResult && (
            <Card title="Intelligence Report" className="border-blue-500/20 bg-blue-500/5">
               <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-blue-500/30">
                  {analysisResult}
               </div>
            </Card>
          )}

          {groundingSources.length > 0 && (
            <section className="bg-slate-800/40 p-5 rounded-2xl border border-blue-500/10 backdrop-blur-sm">
               <header className="flex items-center gap-2 mb-4">
                  <Search className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/80">Search Grounding Citations</span>
               </header>
               <div className="grid grid-cols-1 gap-2">
                 {groundingSources.map((chunk, i) => (
                    chunk.web && (
                      <a 
                        key={i} 
                        href={chunk.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800 transition-all group"
                      >
                         <div className="flex flex-col min-w-0">
                           <span className="text-[11px] font-semibold text-slate-300 truncate">{chunk.web.title || "External Reference"}</span>
                           <span className="text-[9px] text-slate-500 truncate mt-0.5">{new URL(chunk.web.uri).hostname}</span>
                         </div>
                         <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-blue-400 shrink-0 ml-2" />
                      </a>
                    )
                 ))}
               </div>
            </section>
          )}
        </div>

        {/* High Precision Viewport */}
        <div className="lg:col-span-7 xl:col-span-8 h-full flex flex-col">
          <EditorCanvas 
            loading={loading}
            resultImage={resultImage}
            selectedImage={selectedImage}
            error={error}
            onRetry={handleGenerate}
          />
        </div>
      </div>
    </div>
  );
};
