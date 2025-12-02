import React from 'react';
import { Input } from '@/shared/components/ui/Input';

interface StyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const STYLE_PRESETS = [
  'photorealistic',
  'vector art',
  'vintage poster',
  'minimalist branding',
  'cyberpunk',
  'pastel illustration'
];

export const StyleSelector: React.FC<StyleSelectorProps> = ({ value, onChange }) => {
  return (
    <div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="E.g. minimalist, vintage, cyberpunk..."
        className="mb-3"
      />
      <div className="flex flex-wrap gap-2">
        {STYLE_PRESETS.map((style) => (
          <button
            key={style}
            onClick={() => onChange(style)}
            className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
              value === style 
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {style}
          </button>
        ))}
      </div>
    </div>
  );
};