
import React, { useState } from 'react';
import { Spinner, Button } from '@/shared/components/ui';
import { ShoppingBag, Download, AlertCircle, Lightbulb } from 'lucide-react';
import { saveImage, ExportFormat } from '@/shared/utils/image';

interface MerchPreviewProps {
  loading: boolean;
  resultImage: string | null;
  error: string | null;
  errorSuggestion: string | null;
  productName: string;
  stylePreference: string;
  productId: string;
}

export const MerchPreview: React.FC<MerchPreviewProps> = ({
  loading,
  resultImage,
  error,
  errorSuggestion,
  productName,
  stylePreference,
  productId
}) => {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [exportScale, setExportScale] = useState<1 | 2>(1);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!resultImage) return;
    setIsExporting(true);

    const filename = `merch-${productId}-${Date.now()}`;
    
    try {
      await saveImage(resultImage, filename, exportFormat, exportScale);
    } catch (err) {
      console.error(err);
      alert("Failed to export image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 p-1 relative overflow-hidden flex flex-col min-h-[500px]">
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-medium text-white flex items-center gap-2">
        <span>{productName} Preview</span>
        {stylePreference && <span className="text-slate-400 border-l border-white/20 pl-2">{stylePreference}</span>}
      </div>

      <div className="flex-1 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950">
        {loading ? (
          <div className="flex flex-col items-center">
            <Spinner className="w-16 h-16 text-indigo-500 mb-6" />
            <p className="text-xl text-slate-300 font-light tracking-wide animate-pulse">Designing your {productName}...</p>
          </div>
        ) : resultImage ? (
          <img src={resultImage} alt="Merch Mockup" className="max-w-full max-h-full object-contain rounded shadow-2xl" />
        ) : error ? (
          <div className="text-center opacity-90 max-w-md px-6 animate-fadeIn">
            <div className="bg-red-500/10 p-6 rounded-full inline-block mb-4">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-red-400">Generation Failed</h2>
            <p className="text-slate-400 mt-2 mb-4">{error}</p>

            <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-left flex gap-3">
              <Lightbulb className="w-5 h-5 text-yellow-500 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Suggestion</span>
                <p className="text-sm text-slate-400 mt-1">{errorSuggestion}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center opacity-30">
            <ShoppingBag className="w-32 h-32 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Ready to Design</h2>
            <p>Upload a logo and select a product to begin</p>
          </div>
        )}
      </div>

      {/* Export Toolbar */}
      {resultImage && (
        <div className="p-4 bg-slate-800 border-t border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-400">
            Generated with Gemini 2.5 Flash Image
          </div>

          <div className="flex items-center gap-3">
            {/* Format Switcher */}
            <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => setExportFormat('png')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${exportFormat === 'png' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >PNG</button>
              <div className="w-px h-4 bg-slate-700 mx-1"></div>
              <button
                onClick={() => setExportFormat('jpg')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${exportFormat === 'jpg' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >JPG</button>
              <div className="w-px h-4 bg-slate-700 mx-1"></div>
              <button
                onClick={() => setExportFormat('svg')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${exportFormat === 'svg' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >SVG</button>
            </div>

            {/* Scale Switcher - Hide for SVG */}
            {exportFormat !== 'svg' && (
              <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700">
                <button
                  onClick={() => setExportScale(1)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${exportScale === 1 ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >1x</button>
                <div className="w-px h-4 bg-slate-700 mx-1"></div>
                <button
                  onClick={() => setExportScale(2)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${exportScale === 2 ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >2x</button>
              </div>
            )}

            <Button
              onClick={handleExport}
              loading={isExporting}
              loadingText="Saving..."
              className="py-2 h-auto text-sm"
              icon={<Download className="w-4 h-4" />}
            >
              Export
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
