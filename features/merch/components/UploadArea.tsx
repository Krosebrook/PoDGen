import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface UploadAreaProps {
  image: string | null;
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  accept?: string;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ 
  image, 
  onFileSelect, 
  onClear, 
  placeholder = "Upload Image", 
  className = "",
  accept = "image/*"
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
      {image ? (
         <div className="relative border border-slate-600 rounded-lg overflow-hidden group bg-slate-900/50 aspect-video flex items-center justify-center">
           <img src={image} alt="Preview" className="max-w-full max-h-full object-contain" />
           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={() => inputRef.current?.click()}>
              <span className="text-white text-sm font-medium flex items-center gap-2">
                <Upload className="w-4 h-4" /> Change
              </span>
           </div>
           {onClear && (
             <button 
               onClick={handleClear}
               className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-500/80 transition-colors z-10"
             >
               <X className="w-4 h-4" />
             </button>
           )}
         </div>
      ) : (
         <div 
           onClick={() => inputRef.current?.click()}
           className="border-2 border-dashed border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700/50 hover:border-blue-500 transition-all group min-h-[160px]"
         >
           <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
           </div>
           <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{placeholder}</span>
           <span className="text-xs text-slate-500 mt-1">Supports PNG, JPG, WebP</span>
         </div>
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