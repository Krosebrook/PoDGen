
import React from 'react';
import { Tooltip } from '@/shared/components/ui';
import { 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  RotateCw, 
  Droplets, 
  Palette, 
  Hash, 
  Trash2,
  Maximize,
  ArrowRight,
  ArrowDown,
  Layers,
  Square,
  CornerUpRight
} from 'lucide-react';
import { TextOverlayState } from '../hooks/useMerchState';

interface TextOverlayControlsProps {
  overlay: TextOverlayState;
  onChange: (overlay: TextOverlayState) => void;
  disabled: boolean;
}

const FONTS = [
  { name: 'Inter (Sans)', value: 'Inter, sans-serif' },
  { name: 'Outfit (Modern)', value: 'Outfit, sans-serif' },
  { name: 'Playfair (Serif)', value: 'Playfair Display, serif' },
  { name: 'JetBrains (Mono)', value: 'JetBrains Mono, monospace' },
  { name: 'Bebas Neue (Bold)', value: 'Bebas Neue, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Dancing Script', value: 'Dancing Script, cursive' },
  { name: 'Impact', value: 'Impact, sans-serif' },
];

const PRESET_COLORS = [
  '#ffffff', '#000000', '#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#94a3b8'
];

export const TextOverlayControls: React.FC<TextOverlayControlsProps> = ({ overlay, onChange, disabled }) => {
  const handleChange = (key: keyof TextOverlayState, value: any) => {
    onChange({ ...overlay, [key]: value });
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>, key: 'color' | 'bgColor') => {
    const val = e.target.value;
    if (val === '' || /^#?[0-9A-Fa-f]{0,6}$/.test(val)) {
      const formatted = val.startsWith('#') ? val : `#${val}`;
      handleChange(key, formatted);
    }
  };

  const clearText = () => handleChange('text', '');

  return (
    <div className={`space-y-6 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Content Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] uppercase text-slate-500 font-black tracking-[0.2em] flex items-center gap-2">
            <Type className="w-3 h-3" /> Content
          </label>
          {overlay.text && (
            <Tooltip content="Remove all overlay text">
              <button 
                onClick={clearText}
                className="text-[9px] font-black text-slate-500 hover:text-red-400 transition-colors uppercase tracking-tighter flex items-center gap-1"
              >
                <Trash2 className="w-2.5 h-2.5" /> Clear
              </button>
            </Tooltip>
          )}
        </div>
        <Tooltip content="Enter custom text to overlay on the product mockup">
          <div className="relative">
            <textarea
              placeholder="Type your text here..."
              value={overlay.text}
              onChange={(e) => handleChange('text', e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all resize-none min-h-[90px] text-sm leading-relaxed"
            />
          </div>
        </Tooltip>
      </section>

      {/* Style Section */}
      <section className="space-y-4">
        <label className="text-[10px] uppercase text-slate-500 font-black tracking-[0.2em] px-1 flex items-center gap-2">
          <Palette className="w-3 h-3" /> Style & Color
        </label>
        
        <div className="grid grid-cols-1 gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tooltip content="Choose a font family" className="w-full">
                <select 
                  value={overlay.font}
                  onChange={(e) => handleChange('font', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-200 outline-none focus:border-blue-500/50 cursor-pointer appearance-none hover:border-slate-700 transition-colors"
                >
                  {FONTS.map(f => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.name}</option>
                  ))}
                </select>
              </Tooltip>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                <ArrowDown className="w-3 h-3" />
              </div>
            </div>

            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
              {[
                { id: 'left', icon: <AlignLeft className="w-3.5 h-3.5" />, label: 'Align Left' },
                { id: 'center', icon: <AlignCenter className="w-3.5 h-3.5" />, label: 'Align Center' },
                { id: 'right', icon: <AlignRight className="w-3.5 h-3.5" />, label: 'Align Right' }
              ].map(align => (
                <Tooltip key={align.id} content={align.label}>
                  <button
                    onClick={() => handleChange('align', align.id)}
                    className={`p-1.5 rounded-lg transition-all ${overlay.align === align.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                  >
                    {align.icon}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex flex-wrap gap-2 justify-between">
              {PRESET_COLORS.map(c => (
                <Tooltip key={c} content={`Set color to ${c}`}>
                  <button
                    onClick={() => handleChange('color', c)}
                    className={`w-5 h-5 rounded-full border border-black/20 transition-all hover:scale-125 active:scale-90 ${overlay.color === c ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                </Tooltip>
              ))}
            </div>
            
            <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
              <div className="relative group shrink-0">
                <Tooltip content="Pick a custom text color">
                  <div className="relative">
                    <input 
                      type="color" 
                      value={overlay.color.length === 7 ? overlay.color : '#ffffff'}
                      onChange={(e) => handleChange('color', e.target.value)}
                      className="w-10 h-10 opacity-0 absolute inset-0 cursor-pointer z-10"
                    />
                    <div 
                      className="w-10 h-10 rounded-xl border border-slate-800 flex items-center justify-center shadow-inner overflow-hidden transition-all group-hover:border-slate-600"
                      style={{ backgroundColor: overlay.color }}
                    >
                      <Palette className="w-4 h-4 text-black/20" />
                    </div>
                  </div>
                </Tooltip>
              </div>
              <div className="flex-1 relative">
                <Tooltip content="Enter Hex color code" className="w-full">
                  <div className="relative">
                    <input 
                      value={overlay.color.toUpperCase()}
                      onChange={(e) => handleHexChange(e, 'color')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-[10px] font-mono font-bold text-slate-300 outline-none focus:border-blue-500/50 uppercase"
                    />
                    <Hash className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Background Shape Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] uppercase text-slate-500 font-black tracking-[0.2em] flex items-center gap-2">
            <Square className="w-3 h-3" /> Background Shape
          </label>
          <Tooltip content="Toggle text background shape for better legibility">
            <button 
              onClick={() => handleChange('bgEnabled', !overlay.bgEnabled)}
              className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md transition-all ${overlay.bgEnabled ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}
            >
              {overlay.bgEnabled ? 'ON' : 'OFF'}
            </button>
          </Tooltip>
        </div>

        {overlay.bgEnabled && (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 space-y-5 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="relative group shrink-0">
                <Tooltip content="Pick background color">
                  <div className="relative">
                    <input 
                      type="color" 
                      value={overlay.bgColor.length === 7 ? overlay.bgColor : '#000000'}
                      onChange={(e) => handleChange('bgColor', e.target.value)}
                      className="w-10 h-10 opacity-0 absolute inset-0 cursor-pointer z-10"
                    />
                    <div 
                      className="w-10 h-10 rounded-xl border border-slate-800 flex items-center justify-center shadow-inner overflow-hidden transition-all group-hover:border-slate-600"
                      style={{ backgroundColor: overlay.bgColor }}
                    >
                      <Palette className="w-4 h-4 text-white/20" />
                    </div>
                  </div>
                </Tooltip>
              </div>
              <div className="flex-1 relative">
                <Tooltip content="Hex code for background color" className="w-full">
                  <div className="relative">
                    <input 
                      value={overlay.bgColor.toUpperCase()}
                      onChange={(e) => handleHexChange(e, 'bgColor')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-[10px] font-mono font-bold text-slate-300 outline-none focus:border-blue-500/50 uppercase"
                    />
                    <Hash className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                  </div>
                </Tooltip>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">BG Opacity</span>
                <span className="text-[10px] font-mono text-blue-400 font-bold">{overlay.bgOpacity}%</span>
              </div>
              <Tooltip content="Adjust the transparency of the background shape" className="w-full">
                <div className="flex items-center gap-3">
                  <Droplets className="w-3.5 h-3.5 text-slate-600" />
                  <input 
                    type="range" min="0" max="100" value={overlay.bgOpacity} 
                    onChange={(e) => handleChange('bgOpacity', parseInt(e.target.value))}
                    className="flex-1 accent-blue-600 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none"
                  />
                </div>
              </Tooltip>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">BG Padding</span>
                <span className="text-[10px] font-mono text-blue-400 font-bold">{overlay.bgPadding}px</span>
              </div>
              <Tooltip content="Increase spacing around the text" className="w-full">
                <div className="flex items-center gap-3">
                  <Maximize className="w-3.5 h-3.5 text-slate-600" />
                  <input 
                    type="range" min="0" max="60" value={overlay.bgPadding} 
                    onChange={(e) => handleChange('bgPadding', parseInt(e.target.value))}
                    className="flex-1 accent-blue-600 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none"
                  />
                </div>
              </Tooltip>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">BG Rounding</span>
                <span className="text-[10px] font-mono text-blue-400 font-bold">{overlay.bgRounding}px</span>
              </div>
              <Tooltip content="Curve the corners of the background shape" className="w-full">
                <div className="flex items-center gap-3">
                  <CornerUpRight className="w-3.5 h-3.5 text-slate-600" />
                  <input 
                    type="range" min="0" max="40" value={overlay.bgRounding} 
                    onChange={(e) => handleChange('bgRounding', parseInt(e.target.value))}
                    className="flex-1 accent-blue-600 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none"
                  />
                </div>
              </Tooltip>
            </div>
          </div>
        )}
      </section>

      {/* Transform Section */}
      <section className="space-y-4">
        <label className="text-[10px] uppercase text-slate-500 font-black tracking-[0.2em] px-1 flex items-center gap-2">
          <Maximize className="w-3 h-3" /> Layout & Appearance
        </label>
        
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 space-y-5">
          {/* Size */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Font Size</span>
              <span className="text-[10px] font-mono text-blue-400 font-bold">{overlay.size}px</span>
            </div>
            <Tooltip content="Scale text size" className="w-full">
              <div className="flex items-center gap-3">
                <Type className="w-3.5 h-3.5 text-slate-600" />
                <input 
                  type="range" min="8" max="250" value={overlay.size} 
                  onChange={(e) => handleChange('size', parseInt(e.target.value))}
                  className="flex-1 accent-blue-600 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none"
                />
              </div>
            </Tooltip>
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-2.5 h-2.5" /> Text Opacity
              </span>
              <span className="text-[10px] font-mono text-blue-400 font-bold">{overlay.opacity}%</span>
            </div>
            <Tooltip content="Adjust text transparency" className="w-full">
              <div className="flex items-center gap-3">
                <Droplets className="w-3.5 h-3.5 text-slate-600" />
                <input 
                  type="range" min="0" max="100" value={overlay.opacity} 
                  onChange={(e) => handleChange('opacity', parseInt(e.target.value))}
                  className="flex-1 accent-blue-600 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none"
                />
              </div>
            </Tooltip>
          </div>

          {/* Rotation */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Rotation</span>
              <span className="text-[10px] font-mono text-blue-400 font-bold">{overlay.rotation}°</span>
            </div>
            <Tooltip content="Rotate text overlay" className="w-full">
              <div className="flex items-center gap-3">
                <RotateCw className="w-3.5 h-3.5 text-slate-600" />
                <input 
                  type="range" min="-180" max="180" value={overlay.rotation} 
                  onChange={(e) => handleChange('rotation', parseInt(e.target.value))}
                  className="flex-1 accent-blue-600 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none"
                />
              </div>
            </Tooltip>
          </div>

          {/* X Position */}
          <div className="space-y-2 pt-2 border-t border-slate-800/50">
            <div className="flex justify-between">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Horizontal %</span>
              <span className="text-[10px] font-mono text-blue-400 font-bold">{Math.round(overlay.x)}%</span>
            </div>
            <Tooltip content="Move text horizontally" className="w-full">
              <div className="flex items-center gap-3">
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <input 
                  type="range" min="0" max="100" value={overlay.x} 
                  onChange={(e) => handleChange('x', parseInt(e.target.value))}
                  className="flex-1 accent-blue-600 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none"
                />
              </div>
            </Tooltip>
          </div>

          {/* Y Position */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Vertical %</span>
              <span className="text-[10px] font-mono text-blue-400 font-bold">{Math.round(overlay.y)}%</span>
            </div>
            <Tooltip content="Move text vertically" className="w-full">
              <div className="flex items-center gap-3">
                <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                <input 
                  type="range" min="0" max="100" value={overlay.y} 
                  onChange={(e) => handleChange('y', parseInt(e.target.value))}
                  className="flex-1 accent-blue-600 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none"
                />
              </div>
            </Tooltip>
          </div>
        </div>
      </section>
      
      {overlay.text && (
        <div className="text-[10px] text-slate-500 flex items-center gap-2 justify-center bg-blue-500/5 py-3 rounded-xl border border-blue-500/10 mt-2">
           <Layers className="w-3.5 h-3.5 text-blue-500/50" />
           <span>Reposition by dragging directly on the preview</span>
        </div>
      )}
    </div>
  );
};
