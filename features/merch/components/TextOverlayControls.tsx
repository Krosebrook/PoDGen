
import React from 'react';
import { Tooltip } from '@/shared/components/ui';
import { Type, Move, AlignLeft, AlignCenter, AlignRight, RotateCw, Droplets, Palette } from 'lucide-react';
import { TextOverlayState } from '../hooks/useMerchState';

interface TextOverlayControlsProps {
  overlay: TextOverlayState;
  onChange: (overlay: TextOverlayState) => void;
  disabled: boolean;
}

const FONTS = [
  { name: 'Modern Sans', value: 'Inter, sans-serif' },
  { name: 'Classic Serif', value: 'Georgia, serif' },
  { name: 'Monospace', value: 'Courier New, monospace' },
  { name: 'Handwritten', value: 'Brush Script MT, cursive' },
  { name: 'Bold Impact', value: 'Impact, sans-serif' },
  { name: 'Clean Arial', value: 'Arial, sans-serif' },
  { name: 'Elegant Times', value: 'Times New Roman, serif' },
  { name: 'Comic Style', value: 'Comic Sans MS, cursive' },
];

const PRESET_COLORS = [
  '#ffffff', '#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'
];

export const TextOverlayControls: React.FC<TextOverlayControlsProps> = ({ overlay, onChange, disabled }) => {
  const handleChange = (key: keyof TextOverlayState, value: any) => {
    onChange({ ...overlay, [key]: value });
  };

  return (
    <div className={`space-y-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Text Input */}
      <div>
        <Tooltip content="Enter text to burn onto the mockup">
            <div>
                <textarea
                  placeholder="Add text overlay..."
                  value={overlay.text}
                  onChange={(e) => handleChange('text', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-y min-h-[80px] text-sm"
                  rows={3}
                />
            </div>
        </Tooltip>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Font Selector */}
        <div className="col-span-2">
           <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1.5 block flex justify-between">
              <span>Typography</span>
           </label>
           <div className="flex gap-2">
             <Tooltip content="Select font style">
                  <div className="relative w-full">
                    <select 
                        value={overlay.font}
                        onChange={(e) => handleChange('font', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 cursor-pointer appearance-none"
                    >
                        {FONTS.map(f => (
                        <option key={f.value} value={f.value}>{f.name}</option>
                        ))}
                    </select>
                    {/* Custom Arrow */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M0 0L5 5L10 0H0Z"/></svg>
                    </div>
                  </div>
             </Tooltip>
             
             {/* Alignment Group */}
             <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-1 gap-0.5 shrink-0">
                <button
                  onClick={() => handleChange('align', 'left')}
                  className={`p-1.5 rounded transition-colors ${overlay.align === 'left' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleChange('align', 'center')}
                  className={`p-1.5 rounded transition-colors ${overlay.align === 'center' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                   title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleChange('align', 'right')}
                  className={`p-1.5 rounded transition-colors ${overlay.align === 'right' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                   title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
             </div>
           </div>
        </div>
        
        {/* Color Section */}
        <div className="col-span-2">
           <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1.5 block">Color</label>
           <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => handleChange('color', c)}
                    className={`w-6 h-6 rounded-full border border-slate-600 transition-transform hover:scale-110 ${overlay.color === c ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' : ''}`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
                <div className="w-px h-6 bg-slate-700 mx-1"></div>
                <div className="relative">
                  <input 
                    type="color" 
                    value={overlay.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="w-6 h-6 opacity-0 absolute inset-0 cursor-pointer"
                  />
                  <div 
                    className="w-6 h-6 rounded-full border border-slate-600 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 text-slate-400 hover:text-white"
                    title="Custom Color"
                  >
                    <Palette className="w-3 h-3" />
                  </div>
                </div>
              </div>
           </div>
        </div>

        {/* Sliders Section */}
        <div className="col-span-2 space-y-3 pt-1">
          {/* Size */}
          <div>
            <div className="flex justify-between mb-1">
                <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Size</label>
                <span className="text-[10px] text-slate-400">{overlay.size}px</span>
            </div>
            <div className="flex items-center gap-3">
                <Type className="w-4 h-4 text-slate-500" />
                <input 
                type="range" 
                min="10" 
                max="200" 
                value={overlay.size} 
                onChange={(e) => handleChange('size', parseInt(e.target.value))}
                className="flex-1 accent-blue-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>
          </div>

          {/* Rotation */}
          <div>
            <div className="flex justify-between mb-1">
                <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Rotation</label>
                <span className="text-[10px] text-slate-400">{overlay.rotation || 0}°</span>
            </div>
            <div className="flex items-center gap-3">
                <RotateCw className="w-4 h-4 text-slate-500" />
                <input 
                type="range" 
                min="-180" 
                max="180" 
                value={overlay.rotation || 0} 
                onChange={(e) => handleChange('rotation', parseInt(e.target.value))}
                className="flex-1 accent-blue-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>
          </div>

          {/* Opacity */}
          <div>
            <div className="flex justify-between mb-1">
                <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Opacity</label>
                <span className="text-[10px] text-slate-400">{overlay.opacity ?? 100}%</span>
            </div>
            <div className="flex items-center gap-3">
                <Droplets className="w-4 h-4 text-slate-500" />
                <input 
                type="range" 
                min="0" 
                max="100" 
                value={overlay.opacity === undefined ? 100 : overlay.opacity} 
                onChange={(e) => handleChange('opacity', parseInt(e.target.value))}
                className="flex-1 accent-blue-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>
          </div>
        </div>
      </div>
      
      {overlay.text && (
        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 justify-center bg-slate-800/50 py-1.5 rounded border border-slate-700/50 mt-2">
           <Move className="w-3 h-3" />
           Drag text on preview to position
        </div>
      )}
    </div>
  );
};
