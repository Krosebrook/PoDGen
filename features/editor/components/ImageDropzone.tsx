
import React, { useRef, useState } from 'react';
import { Upload, RefreshCw } from 'lucide-react';

interface ImageDropzoneProps {
  selectedImage: string | null;
  onFileSelect: (file: File) => void;
  onReset: () => void;
  error?: string | null;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({ selectedImage, onFileSelect, onReset, error }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div 
      className={`flex-1 border-dashed rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-200 ease-out cursor-pointer
        ${isDragging 
          ? 'border-4 border-blue-500 bg-blue-500/20 scale-[1.01] shadow-xl shadow-blue-500/10' 
          : error 
            ? 'border-2 border-red-500/50 bg-slate-800/50' 
            : 'border-2 border-slate-700 bg-slate-800/50 hover:border-blue-500 hover:bg-slate-800'
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
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isDragging ? 'bg-blue-600 scale-110' : 'bg-slate-700 group-hover:bg-blue-600'}`}>
            <Upload className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-slate-300'}`} />
          </div>
          <p className={`font-medium text-lg transition-colors ${isDragging ? 'text-blue-300' : 'text-slate-300'}`}>
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
        onChange={(e) => {
            const file = e.target.files?.[0];
            if(file) onFileSelect(file);
        }} 
        className="hidden" 
        accept="image/*"
      />
      {selectedImage && (
        <div className="absolute top-2 right-2 bg-black/60 rounded-full p-2 hover:bg-black/80 transition z-10" onClick={(e) => { e.stopPropagation(); onReset(); }}>
           <RefreshCw className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};
