
import React from 'react';
import { MerchProduct } from '../types';
import { MERCH_PRODUCTS } from '../data/products';

interface ProductGridProps {
  selectedId: string;
  onSelect: (product: MerchProduct) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ selectedId, onSelect }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
      {MERCH_PRODUCTS.map(product => (
        <div 
          key={product.id}
          onClick={() => onSelect(product)}
          className={`
            group relative p-3 rounded-xl border cursor-pointer transition-all duration-300
            hover:shadow-lg hover:-translate-y-1
            flex flex-col h-full
            ${selectedId === product.id 
              ? 'bg-blue-600/10 border-blue-500 shadow-blue-900/20 ring-1 ring-blue-500/50' 
              : 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
            }
          `}
        >
          <div className="aspect-square w-full rounded-lg bg-slate-800 overflow-hidden relative mb-3">
            <img 
              src={product.placeholderImage} 
              alt={product.name} 
              className={`w-full h-full object-cover transition-transform duration-500 ${
                selectedId === product.id ? 'scale-105' : 'group-hover:scale-110 opacity-80 group-hover:opacity-100'
              }`} 
            />
            {selectedId === product.id && (
              <div className="absolute inset-0 bg-blue-500/10 pointer-events-none ring-inset ring-1 ring-white/10" />
            )}
          </div>
          
          <div className="flex flex-col flex-grow">
            <h4 className={`text-sm font-semibold mb-1.5 leading-tight ${
              selectedId === product.id ? 'text-blue-100' : 'text-slate-200 group-hover:text-white'
            }`}>
              {product.name}
            </h4>
            <p className={`text-xs leading-relaxed line-clamp-2 ${
              selectedId === product.id ? 'text-blue-200/70' : 'text-slate-500 group-hover:text-slate-400'
            }`}>
              {product.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
