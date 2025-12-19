
import React, { useMemo } from 'react';
import { Input } from '@/shared/components/ui/Input';
import { Sparkles, Palette, Zap } from 'lucide-react';
import { Tooltip } from '@/shared/components/ui';

interface StyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  productName: string;
}

const getPresets = (productName: string) => {
  const p = productName.toLowerCase();
  
  // High-priority requested styles
  const trending = [
    'Photorealistic', 
    'Minimalist Branding', 
    'Cyberpunk Neon', 
    'Studio Lighting'
  ];

  const productSpecific: string[] = [];
  
  // Tech & Desktop Accessories
  if (p.includes('phone') || p.includes('case') || p.includes('laptop') || p.includes('mouse') || p.includes('tech') || p.includes('desk')) {
    productSpecific.push('Tech Gadget Aesthetic', 'Matte Black Stealth', 'Holographic Prism', 'Clean Desktop Setup', 'Vaporwave Glitch');
  }

  // Drinkware
  else if (p.includes('mug') || p.includes('bottle') || p.includes('tumbler') || p.includes('cup') || p.includes('glass')) {
    productSpecific.push('Cozy Morning Vibe', 'Dark Academia Study', 'Minimalist Cafe', 'Outdoor Adventure', 'Rustic Timber');
  }

  // Apparel & Fashion
  else if (p.includes('shirt') || p.includes('hoodie') || p.includes('cap') || p.includes('hat') || p.includes('beanie') || p.includes('sock') || p.includes('apron')) {
    productSpecific.push('Urban Techwear', '90s Streetwear', 'High-Fashion Editorial', 'Eco-Organic Texture', 'Vintage Wash');
  }

  // Art, Print & Home
  else if (p.includes('poster') || p.includes('canvas') || p.includes('pillow') || p.includes('wall') || p.includes('notebook') || p.includes('tote')) {
    productSpecific.push('Mid-Century Modern', 'Industrial Loft', 'Scandi-Minimalism', 'Gallery Exhibition', 'Bohemian Interior');
  }

  // Stickers & Small Goods
  else {
    productSpecific.push('Prismatic Holographic', 'Die-Cut Vinyl', 'Macro Depth', 'Street Art Wheatpaste', 'Retro Badge');
  }

  return { trending, productSpecific };
};

const getProductSuggestions = (productName: string): string[] => {
  const p = productName.toLowerCase();
  
  const universalStyles = [
    "Luxury branding with deep matte textures and sophisticated rim lighting",
    "Surreal floating composition with abstract geometric shapes and soft pastel gradients",
    "Hyper-realistic macro photography focusing on premium material grain and intricate details",
    "Bauhaus-inspired design with bold primary colors and strong mathematical grid layout"
  ];

  if (p.includes('shirt') || p.includes('hoodie') || p.includes('socks')) {
    return [
      ...universalStyles,
      "Gritty urban techwear aesthetic with rain-slicked concrete and neon blue backlight",
      "Vintage 1990s hip-hop fashion photography with heavy film grain and warm nostalgic tones",
      "High-fashion editorial spread with dramatic lighting and a clean, minimalist cyclorama wall"
    ];
  }

  return [
    ...universalStyles,
    "Interior design magazine layout featuring a sun-drenched Scandinavian living room",
    "Moody industrial loft interior with exposed red brick walls and focused spot lighting"
  ];
};

export const StyleSelector: React.FC<StyleSelectorProps> = ({ value, onChange, productName }) => {
  const { trending, productSpecific } = useMemo(() => getPresets(productName), [productName]);

  const handleSuggest = () => {
    const suggestions = getProductSuggestions(productName);
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    onChange(random);
  };

  const isActive = (style: string) => value.toLowerCase() === style.toLowerCase();

  return (
    <div className="space-y-4">
      {/* Search/Input Field */}
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <Tooltip content="Describe the mood, lighting, or setting for your mockup">
             <div className="w-full">
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={`Describe ${productName.toLowerCase()} style...`}
                    className="h-[42px] bg-slate-900/50"
                />
             </div>
          </Tooltip>
        </div>
        <Tooltip content={`Generate a professional creative prompt`} side="left">
          <button
            onClick={handleSuggest}
            className="shrink-0 h-[42px] px-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm group"
            type="button"
          >
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline font-bold text-[10px] uppercase tracking-wider">Magic</span>
          </button>
        </Tooltip>
      </div>
      
      {/* Trending / Core Presets */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 px-1">
           <Zap className="w-3 h-3 text-amber-500" />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trending Styles</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {trending.map((style) => (
            <Tooltip key={style} content={`Apply ${style} style`} side="bottom">
              <button
                onClick={() => onChange(style)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  isActive(style)
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20' 
                    : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                {style}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Product Specific Recommendations */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center gap-2 px-1">
           <Palette className="w-3 h-3 text-indigo-500" />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Curated for {productName}</span>
        </div>
        <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
          {productSpecific.map((style) => (
            <Tooltip key={style} content={`Apply ${style} style`} side="bottom">
              <button
                onClick={() => onChange(style)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  isActive(style)
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/20' 
                    : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                {style}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
};
