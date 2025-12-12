
import React from 'react';
import { AppMode } from '@/shared/types';
import { Zap, Wand2, Shirt, Code } from 'lucide-react';

interface ShellProps {
  activeTab: AppMode;
  onTabChange: (tab: AppMode) => void;
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ activeTab, onTabChange, children }) => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              NanoGen Studio
            </span>
          </div>
          
          <nav className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
            <NavButton 
              active={activeTab === 'EDITOR'} 
              onClick={() => onTabChange('EDITOR')} 
              icon={<Wand2 className="w-4 h-4" />} 
              label="AI Editor" 
            />
            <NavButton 
              active={activeTab === 'MERCH'} 
              onClick={() => onTabChange('MERCH')} 
              icon={<Shirt className="w-4 h-4" />} 
              label="Merch Studio" 
            />
            <NavButton 
              active={activeTab === 'INTEGRATIONS'} 
              onClick={() => onTabChange('INTEGRATIONS')} 
              icon={<Code className="w-4 h-4" />} 
              label="API Connect" 
            />
          </nav>

          <div className="w-8"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-[calc(100vh-8rem)]">
          {children}
        </div>
      </main>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ 
  active, onClick, icon, label 
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
      active 
        ? 'bg-slate-700 text-white shadow-sm' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}
  >
    {icon}
    {label}
  </button>
);
