import React, { useState, useRef } from 'react';
import { generateOrEditImage } from '../services/gemini';
import { Spinner } from './ui/Spinner';
import { Upload, ShoppingBag, Download, ArrowRight, Layers } from 'lucide-react';
import { MerchProduct } from '../types';

const PRODUCTS: MerchProduct[] = [
  { 
    id: 'tshirt-white', 
    name: 'Classic White Tee', 
    description: 'Cotton crew neck', 
    defaultPrompt: 'A professional product photography shot of a plain white t-shirt lying flat on a minimalist concrete surface, featuring this logo printed clearly on the chest.' 
  },
  { 
    id: 'hoodie-black', 
    name: 'Streetwear Hoodie', 
    description: 'Black oversized hoodie', 
    defaultPrompt: 'A high-end studio photo of a black streetwear hoodie on a mannequin, with this logo prominently displayed on the center chest area. Cinematic lighting.' 
  },
  { 
    id: 'mug-ceramic', 
    name: 'Ceramic Mug', 
    description: 'White glossy finish', 
    defaultPrompt: 'A cozy lifestyle photography shot of a white ceramic coffee mug on a wooden table next to a book, with this logo printed on the side of the mug.' 
  },
  { 
    id: 'tote-bag', 
    name: 'Canvas Tote', 
    description: 'Eco-friendly beige tote', 
    defaultPrompt: 'A clean studio shot of a beige canvas tote bag hanging on a hook, with this logo design centered on the bag fabric.' 
  },
  {
    id: 'cap-baseball',
    name: 'Baseball Cap',
    description: 'Navy blue structured cap',
    defaultPrompt: 'A photorealistic closeup of a navy blue baseball cap sitting on a shelf, with this logo embroidered on the front panel.'
  },
  {
    id: 'phone-case',
    name: 'Phone Case',
    description: 'Slim protective case',
    defaultPrompt: 'A sleek product shot of a modern smartphone case lying on a marble countertop, with this logo design printed on the back of the case.'
  },
  {
    id: 'sticker-pack',
    name: 'Sticker Pack',
    description: 'Die-cut vinyl stickers',
    defaultPrompt: 'A creative flat lay photography shot of die-cut vinyl stickers scattered on a laptop lid, featuring this logo as the main sticker design with a white border.'
  },
  {
    id: 'mug-travel',
    name: 'Travel Tumbler',
    description: 'Stainless steel coffee cup',
    defaultPrompt: 'A cinematic lifestyle shot of a matte black stainless steel travel coffee tumbler sitting on an office desk, with this logo laser-etched onto the side.'
  }
];

interface MerchStudioProps {
  onImageGenerated: (url: string, prompt: string) => void;
}

export const MerchStudio: React.FC<MerchStudioProps> = ({ onImageGenerated }) => {
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MerchProduct>(PRODUCTS[0]);
  const [loading, setLoading] = useState(false);
  const [generatedMerch, setGeneratedMerch] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoImage(reader.result as string);
        setGeneratedMerch(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!logoImage) return;
    setLoading(true);
    try {
      // We pass the logo and ask Gemini to generate the product shot incorporating it.
      const result = await generateOrEditImage(logoImage, selectedProduct.defaultPrompt);
      setGeneratedMerch(result);
      onImageGenerated(result, selectedProduct.defaultPrompt);
    } catch (error) {
      alert("Failed to generate merch mockup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      {/* Sidebar: Controls */}
      <div className="lg:col-span-4 flex flex-col space-y-6 overflow-y-auto pr-2">
        {/* Step 1: Upload Logo */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">1</div>
             <h3 className="font-semibold text-slate-200">Upload Brand Asset</h3>
          </div>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700/50 hover:border-blue-500 transition-all group"
          >
            {logoImage ? (
               <div className="relative w-full aspect-square bg-slate-900/50 rounded flex items-center justify-center p-2">
                 <img src={logoImage} alt="Logo" className="max-w-full max-h-full object-contain" />
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-sm">Change Logo</span>
                 </div>
               </div>
            ) : (
               <>
                 <Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-blue-400" />
                 <span className="text-sm text-slate-400">Click to upload logo</span>
               </>
            )}
            <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
          </div>
        </div>

        {/* Step 2: Select Product */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex-1">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">2</div>
             <h3 className="font-semibold text-slate-200">Select Product</h3>
          </div>

          <div className="space-y-3">
             {PRODUCTS.map(product => (
               <div 
                 key={product.id}
                 onClick={() => setSelectedProduct(product)}
                 className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${selectedProduct.id === product.id ? 'bg-blue-600/10 border-blue-500 shadow-sm' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}
               >
                 <div className={`p-2 rounded-md ${selectedProduct.id === product.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <ShoppingBag className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className={`text-sm font-medium ${selectedProduct.id === product.id ? 'text-blue-100' : 'text-slate-300'}`}>{product.name}</h4>
                   <p className="text-xs text-slate-500">{product.description}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={!logoImage || loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white p-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
        >
          {loading ? <Spinner /> : <Layers className="w-6 h-6" />}
          {loading ? 'Generating Mockup...' : 'Generate Mockup'}
        </button>
      </div>

      {/* Main Area: Preview */}
      <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-700 p-1 relative overflow-hidden flex flex-col">
          <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-medium text-white">
             {selectedProduct.name} Preview
          </div>
          
          <div className="flex-1 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950">
             {loading ? (
                <div className="flex flex-col items-center">
                   <Spinner className="w-16 h-16 text-indigo-500 mb-6" />
                   <p className="text-xl text-slate-300 font-light tracking-wide animate-pulse">Designing your {selectedProduct.name}...</p>
                </div>
             ) : generatedMerch ? (
                <img src={generatedMerch} alt="Merch Mockup" className="max-w-full max-h-full object-contain rounded shadow-2xl" />
             ) : (
                <div className="text-center opacity-30">
                   <ShoppingBag className="w-32 h-32 mx-auto mb-4" />
                   <h2 className="text-2xl font-bold">Ready to Design</h2>
                   <p>Upload a logo and select a product to begin</p>
                </div>
             )}
          </div>

          {generatedMerch && (
            <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-between items-center">
               <div className="text-sm text-slate-400">
                  Generated with Gemini 2.5 Flash Image
               </div>
               <a 
                 href={generatedMerch} 
                 download={`merch-${selectedProduct.id}.png`}
                 className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
               >
                 <Download className="w-4 h-4" /> Download High-Res
               </a>
            </div>
          )}
      </div>
    </div>
  );
};