
import React from 'react';
import { Input } from '@/shared/components/ui/Input';
import { Sparkles } from 'lucide-react';
import { Tooltip } from '@/shared/components/ui';

interface StyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  productName: string;
}

const STYLE_PRESETS = [
  'photorealistic',
  'vector art',
  'vintage poster',
  'minimalist branding',
  'cyberpunk',
  'pastel illustration'
];

const SUGGESTIONS = [
  "High-end luxury aesthetic with gold accents",
  "Gritty urban streetwear vibe with high contrast",
  "Eco-friendly organic look with earth tones",
  "Retro 80s vaporwave style with neon lights",
  "Futuristic cyberpunk design with glowing edges",
  "Clean minimalist Scandinavian design",
  "Vintage washed-out denim look",
  "Vibrant pop-art style with bold outlines",
  "Matte black finish with glossy highlights"
];

export const StyleSelector: React.FC<StyleSelectorProps> = ({ value, onChange, productName }) => {
  const handleSuggest = () => {
    const random = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
    onChange(random);
  };

  return (
    <div>
      <div className="flex gap-2 mb-3 items-start">
        <div className="flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`E.g. minimalist ${productName.toLowerCase()}...`}
          />
        </div>
        <Tooltip content="Auto-generate a creative style" side="left">
          <button
            onClick={handleSuggest}
            className="mt-[1px] h-[42px] px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg transition-colors flex items-center justify-center gap-2"
            type="button"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline font-medium text-xs">Magic</span>
          </button>
        </Tooltip>
      </div>
      <div className="flex flex-wrap gap-2">
        {STYLE_PRESETS.map((style) => (
          <Tooltip key={style} content={`Apply ${style} style`}>
            <button
              onClick={() => onChange(style)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
                value === style 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {style}
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};
