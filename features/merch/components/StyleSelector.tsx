
import React, { useMemo } from 'react';
import { Input } from '@/shared/components/ui/Input';
import { Sparkles } from 'lucide-react';
import { Tooltip } from '@/shared/components/ui';

interface StyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  productName: string;
}

const getPresets = (productName: string): string[] => {
  const p = productName.toLowerCase();
  
  // Base styles that are versatile
  const base = ['Photorealistic', 'Studio Lighting'];

  // Tech Accessories (Phone cases, laptop sleeves, etc)
  if (p.includes('phone') || p.includes('case') || p.includes('laptop') || p.includes('mouse') || p.includes('tech')) {
    return [...base, 'Tech Gadget Aesthetic', 'Isometric 3D', 'Cyberpunk Neon', 'Holographic', 'Matte Black', 'Gaming Setup', 'Vaporwave'];
  }

  // Drinkware (Mugs, bottles, tumblers)
  if (p.includes('mug') || p.includes('bottle') || p.includes('tumbler') || p.includes('cup') || p.includes('glass')) {
    return [...base, 'Cozy Morning Vibe', 'Artisan Ceramic', 'Outdoor Adventure', 'Cafe Atmosphere', 'Soft Bokeh', 'Rustic Wood'];
  }

  // Apparel (T-Shirts, Hoodies, Hats)
  if (p.includes('shirt') || p.includes('hoodie') || p.includes('cap') || p.includes('hat') || p.includes('beanie') || p.includes('sock') || p.includes('apron')) {
    return [...base, 'Urban Streetwear', 'Vintage 90s', 'Y2K Fashion', 'High Fashion', 'Eco Organic', 'Flat Lay', 'Grunge'];
  }

  // Decor & Print (Posters, Canvas, Pillows)
  if (p.includes('poster') || p.includes('canvas') || p.includes('pillow') || p.includes('wall') || p.includes('notebook') || p.includes('tote')) {
    return [...base, 'Interior Design', 'Bohemian Chic', 'Industrial Loft', 'Scandinavian', 'Mid-Century Modern', 'Gallery Wall', 'Vector Art'];
  }

  // Stickers & Small Items
  if (p.includes('sticker') || p.includes('pin') || p.includes('keychain') || p.includes('magnet')) {
    return [...base, 'Die-Cut Vinyl', 'Holographic', 'Macro Photography', 'Pop Art', 'Paper Texture', 'Sketchbook'];
  }

  // Default Fallback
  return [...base, 'Cinematic', 'Vector Art', 'Vintage', 'Minimalist', '3D Render', 'Line Art', 'Pastel'];
};

const getProductSuggestions = (productName: string): string[] => {
  const p = productName.toLowerCase();
  
  // Core styles suitable for any product
  const universalStyles = [
    "High-end luxury aesthetic with matte black finish and gold foil accents",
    "Minimalist Scandinavian design with soft lighting, neutral colors, and geometric simplicity",
    "Bauhaus design style with strong geometric shapes, primary colors, and clean functional layout",
    "Vibrant pop-art style with bold black outlines, halftone patterns, and saturated primary colors",
    "Surreal Dali-esque composition with melting forms, floating elements, and dreamlike atmosphere"
  ];

  // Apparel (T-Shirts, Hoodies, Caps, Socks, Beanies)
  if (p.includes('shirt') || p.includes('hoodie') || p.includes('socks') || p.includes('cap') || p.includes('beanie')) {
    return [
      ...universalStyles,
      "Gritty urban streetwear vibe with distressed textures, concrete background, and high contrast lighting",
      "Vintage 90s athletic aesthetic with washed-out cotton texture and retro color blocking",
      "Y2K futuristic fashion style with chrome accents, liquid shapes, and neon lighting",
      "Eco-friendly organic branding with botanical shadows, earth tones, and natural linen textures",
      "Dark academia aesthetic with rich mahogany tones, moody lighting, and classical composition",
      "Cyberpunk fashion photography with neon rain-slicked streets and holographic overlays",
      "High-fashion editorial look with dramatic posing and clean studio background",
      "Retro thrift store aesthetic with warm film grain and nostalgic atmosphere"
    ];
  }

  // Drinkware (Mugs, Tumblers, Bottles)
  if (p.includes('mug') || p.includes('bottle') || p.includes('tumbler')) {
    return [
      ...universalStyles,
      "Cozy morning coffee vibe with warm sunlight, wooden table texture, and rising steam",
      "Sleek modern workspace aesthetic with soft focus background and clean white desk",
      "Outdoor adventure lifestyle shot with forest bokeh, natural lighting, and morning mist",
      "Artisan ceramic studio style with clay textures, pottery tools, and soft northern light",
      "Matte tactical gear look with rugged textures, dark mood, and sharp rim lighting",
      "Summer picnic vibe with bright natural light, fresh fruits, and grassy background",
      "Dark moody cafe setting with steam, coffee beans, and ambient warm lighting"
    ];
  }

  // Tech & Small Goods (Stickers, Phone Cases, Laptop Sleeves)
  if (p.includes('sticker') || p.includes('laptop') || p.includes('phone') || p.includes('case')) {
    return [
      ...universalStyles,
      "Holographic iridescent finish with prism light reflections and glossy texture",
      "Tech-reviewer studio aesthetic with RGB backlighting and crisp depth of field",
      "Vaporwave aesthetic with purple grid background, glitch effects, and retro computer graphics",
      "Isometric 3D render with clay-morphism texture, soft shadows, and vibrant plastic colors",
      "Hand-drawn sketchbook style with pencil hatching, rough edges, and paper texture background",
      "Clean Apple-style product photography with pure white background and soft reflections",
      "Gaming setup aesthetic with neon purple and blue lighting and mechanical keyboard background"
    ];
  }

  // Decor & Misc (Pillow, Canvas, Skate, Notebook, Tote)
  return [
    ...universalStyles,
    "Interior design magazine style with perfectly styled living room background and soft diffuse light",
    "Bohemian chic aesthetic with dried flowers, rattan textures, and warm golden hour lighting",
    "Industrial loft style with exposed brick, metal textures, and cool tone lighting",
    "Vintage travel poster style with flat vector colors and distressed paper texture",
    "Psychedelic 60s rock poster style with swirling patterns, liquid typography, and vibrant clashing colors",
    "Urban skate culture style with fisheye lens perspective and gritty concrete textures",
    "Minimalist Japanese zen interior with tatami mats, bonsai, and balanced composition",
    "Bright and airy Scandi living room with white walls, light wood, and natural light"
  ];
};

export const StyleSelector: React.FC<StyleSelectorProps> = ({ value, onChange, productName }) => {
  const presets = useMemo(() => getPresets(productName), [productName]);

  const handleSuggest = () => {
    const suggestions = getProductSuggestions(productName);
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    onChange(random);
  };

  return (
    <div>
      <div className="flex gap-2 mb-3 items-start">
        <div className="flex-1">
          <Tooltip content="Type a custom artistic style, mood, or context">
             <div>
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={`E.g. minimalist ${productName.toLowerCase()}...`}
                />
             </div>
          </Tooltip>
        </div>
        <Tooltip content={`Auto-generate a creative style for ${productName}`} side="left">
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
        {presets.map((style) => (
          <Tooltip key={style} content={`Apply ${style} style`}>
            <button
              onClick={() => onChange(style)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
                value.toLowerCase() === style.toLowerCase()
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
