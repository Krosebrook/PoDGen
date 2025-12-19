
import React, { useRef, useState } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear?.();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  return (
    <div 
      className={`space-y-2 group/upload ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {loading ? (
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center min-h-[160px] bg-slate-900/50 relative overflow-hidden transition-all">
           <div className="absolute inset-0 bg-slate-900/80 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
             <Spinner className="w-8 h-8 text-blue-500 mb-3" />
             <span className="text-sm text-slate-300 font-medium animate-pulse">Processing Image...</span>
           </div>
        </div>
      ) : image ? (
         <div className={`relative border border-slate-600 rounded-lg overflow-hidden group bg-slate-900/50 aspect-video flex items-center justify-center transition-all ${isDragging ? 'border-blue-500 scale-[1.02] ring-4 ring-blue-500/10' : ''}`}>
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
             className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all group min-h-[160px] ${
               isDragging 
                 ? 'border-blue-500 bg-blue-500/10 scale-[1.02] ring-4 ring-blue-500/5 shadow-2xl shadow-blue-500/10' 
                 : 'border-slate-600 hover:bg-slate-700/50 hover:border-blue-500'
             }`}
           >
             <div className={`w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 transition-colors shadow-lg ${isDragging ? 'bg-blue-600' : 'group-hover:bg-blue-500/20'}`}>
                <Upload className={`w-6 h-6 transition-colors ${isDragging ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
             </div>
             <span className={`text-sm font-medium transition-colors mb-2 ${isDragging ? 'text-blue-200' : 'text-slate-300 group-hover:text-white'}`}>
               {isDragging ? 'Drop Image Here' : placeholder}
             </span>
             
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
