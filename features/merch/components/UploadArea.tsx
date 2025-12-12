
import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Spinner } from '@/shared/components/ui/Spinner';
import { Tooltip } from '@/shared/components/ui';

interface UploadAreaProps {
  image: string | null;
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  accept?: string;
  loading?: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ 
  image, 
  onFileSelect, 
  onClear, 
  placeholder = "Upload Image", 
  className = "",
  accept = "image/*",
  loading = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset input value to allow re-uploading the same file if needed
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear?.();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {loading ? (
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center min-h-[160px] bg-slate-900/50 relative overflow-hidden">
           <div className="absolute inset-0 bg-slate-900/80 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
             <Spinner className="w-8 h-8 text-blue-500 mb-3" />
             <span className="text-sm text-slate-300 font-medium animate-pulse">Processing Image...</span>
           </div>
        </div>
      ) : image ? (
         <div className="relative border border-slate-600 rounded-lg overflow-hidden group bg-slate-900/50 aspect-video flex items-center justify-center">
           <img src={image} alt="Preview" className="max-w-full max-h-full object-contain" />
           <Tooltip content="Replace this image">
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={() => inputRef.current?.click()}>
                <span className="text-white text-sm font-medium flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-600 shadow-lg">
                  <Upload className="w-4 h-4" /> Change Image
                </span>
              </div>
           </Tooltip>
           {onClear && (
             <div className="absolute top-2 right-2 z-10">
               <Tooltip content="Remove image" side="left">
                 <button 
                   onClick={handleClear}
                   className="bg-black/60 text-white p-1.5 rounded-full hover:bg-red-500/80 transition-colors"
                 >
                   <X className="w-4 h-4" />
                 </button>
               </Tooltip>
             </div>
           )}
         </div>
      ) : (
         <Tooltip content="Click or drag to upload file">
           <div 
             onClick={() => inputRef.current?.click()}
             className="border-2 border-dashed border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700/50 hover:border-blue-500 transition-all group min-h-[160px]"
           >
             <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors shadow-lg">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
             </div>
             <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors mb-2">{placeholder}</span>
             
             <div className="flex gap-1.5 mt-2">
               <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700 font-medium">PNG</span>
               <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700 font-medium">JPG</span>
               <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700 font-medium">WEBP</span>
             </div>
           </div>
         </Tooltip>
      )}
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleChange} 
        className="hidden" 
        accept={accept} 
      />
    </div>
  );
};
