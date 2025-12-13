
import React from 'react';
import { Input } from '@/shared/components/ui/Input';
import { Tooltip } from '@/shared/components/ui';
import { Type, Move, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { TextOverlayState } from '../hooks/useMerchState';

interface TextOverlayControlsProps {
  overlay: TextOverlayState;
  onChange: (overlay: TextOverlayState) => void;
  disabled: boolean;
}

const FONTS = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Serif', value: 'Georgia, serif' },
  { name: 'Mono', value: 'Courier New, monospace' },
  { name: 'Cursive', value: 'Brush Script MT, cursive' },
  { name: 'Impact', value: 'Impact, sans-serif' },
];

export const TextOverlayControls: React.FC<TextOverlayControlsProps> = ({ overlay, onChange, disabled }) => {
  const handleChange = (key: keyof TextOverlayState, value: any) => {
    onChange({ ...overlay, [key]: value });
  };

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div>
        <Tooltip content="Enter text to burn onto the mockup">
            <div>
                <Input
                placeholder="Add text overlay..."
                value={overlay.text}
                onChange={(e) => handleChange('text', e.target.value)}
                className="mb-2"
                />
            </div>
        </Tooltip>
      </div>

      {/* Alignment Controls */}
      <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-1 gap-1">
        <Tooltip content="Align Left">
          <button
            onClick={() => handleChange('align', 'left')}
            className={`p-1.5 rounded flex-1 flex justify-center transition-colors ${overlay.align === 'left' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <AlignLeft className="w-4 h-4" />
          </button>
        </Tooltip>
        <Tooltip content="Align Center">
          <button
            onClick={() => handleChange('align', 'center')}
            className={`p-1.5 rounded flex-1 flex justify-center transition-colors ${overlay.align === 'center' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <AlignCenter className="w-4 h-4" />
          </button>
        </Tooltip>
        <Tooltip content="Align Right">
          <button
            onClick={() => handleChange('align', 'right')}
            className={`p-1.5 rounded flex-1 flex justify-center transition-colors ${overlay.align === 'right' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
           <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">Font</label>
           <Tooltip content="Select font style">
                <select 
                    value={overlay.font}
                    onChange={(e) => handleChange('font', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-sm text-white outline-none focus:border-blue-500 cursor-pointer"
                >
                    {FONTS.map(f => (
                    <option key={f.value} value={f.value}>{f.name}</option>
                    ))}
                </select>
           </Tooltip>
        </div>
        
        <div>
           <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">Color</label>
           <Tooltip content="Choose text color">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 h-[38px] cursor-pointer">
                    <input 
                    type="color" 
                    value={overlay.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0"
                    />
                    <span className="text-xs text-slate-400 font-mono uppercase">{overlay.color}</span>
                </div>
           </Tooltip>
        </div>
      </div>

      <Tooltip content="Adjust text size">
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-lg p-3 cursor-ew-resize">
            <Type className="w-4 h-4 text-slate-500" />
            <input 
            type="range" 
            min="10" 
            max="200" 
            value={overlay.size} 
            onChange={(e) => handleChange('size', parseInt(e.target.value))}
            className="flex-1 accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-slate-400 w-6 text-right">{overlay.size}</span>
        </div>
      </Tooltip>
      
      {overlay.text && (
        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 justify-center bg-slate-800/50 py-1 rounded">
           <Move className="w-3 h-3" />
           Drag text on image to position
        </div>
      )}
    </div>
  );
};
