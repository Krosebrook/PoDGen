
import React from 'react';
import { MerchProduct } from '../types';
import { MERCH_PRODUCTS } from '../data/products';

interface ProductGridProps {
  selectedId: string;
  onSelect: (product: MerchProduct) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ selectedId, onSelect }) => {
  return (
    <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
      {MERCH_PRODUCTS.map(product => (
        <div 
          key={product.id}
          onClick={() => onSelect(product)}
          className={`p-2 rounded-lg border cursor-pointer transition-all flex flex-col gap-2 ${selectedId === product.id ? 'bg-blue-600/10 border-blue-500 shadow-sm ring-1 ring-blue-500/50' : 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:bg-slate-800'}`}
        >
          <div className="aspect-square w-full rounded-md bg-slate-800 overflow-hidden relative">
            <img 
              src={product.placeholderImage} 
              alt={product.name} 
              className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" 
            />
            {selectedId === product.id && (
              <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
            )}
          </div>
          <div className="px-1">
            <h4 className={`text-xs font-medium truncate ${selectedId === product.id ? 'text-blue-100' : 'text-slate-300'}`}>{product.name}</h4>
            <p className="text-[10px] text-slate-500 truncate">{product.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
