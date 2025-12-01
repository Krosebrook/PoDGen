
import React, { useState } from 'react';
import { ImageEditor } from './features/editor/components/ImageEditor';
import { MerchStudio } from './features/merch/components/MerchStudio';
import { IntegrationCode } from './features/integrations/components/IntegrationCode';
import { AppMode } from './shared/types';
import { Wand2, Shirt, Code, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppMode>('EDITOR');
  const [lastPrompt, setLastPrompt] = useState<string>("");

  const handleImageGenerated = (url: string, prompt: string) => {
    setLastPrompt(prompt);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col">
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
            <button
              onClick={() => setActiveTab('EDITOR')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'EDITOR' 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              AI Editor
            </button>
            <button
              onClick={() => setActiveTab('MERCH')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'MERCH' 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Shirt className="w-4 h-4" />
              Merch Studio
            </button>
            <button
              onClick={() => setActiveTab('INTEGRATIONS')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'INTEGRATIONS' 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Code className="w-4 h-4" />
              API Connect
            </button>
          </nav>

          <div className="w-8"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-[calc(100vh-8rem)]">
          {activeTab === 'EDITOR' && (
            <div className="h-full animate-fadeIn">
               <div className="mb-6">
                 <h1 className="text-2xl font-bold text-white mb-2">AI Image Editor</h1>
                 <p className="text-slate-400">Upload an image and use natural language to transform it instantly.</p>
               </div>
               <div className="h-[calc(100%-5rem)]">
                 <ImageEditor onImageGenerated={handleImageGenerated} />
               </div>
            </div>
          )}

          {activeTab === 'MERCH' && (
            <div className="h-full animate-fadeIn">
               <div className="mb-6">
                 <h1 className="text-2xl font-bold text-white mb-2">On-Demand Merch Generator</h1>
                 <p className="text-slate-400">Visualize your brand on premium products in seconds.</p>
               </div>
               <div className="h-[calc(100%-5rem)]">
                 <MerchStudio onImageGenerated={handleImageGenerated} />
               </div>
            </div>
          )}

          {activeTab === 'INTEGRATIONS' && (
            <div className="h-full animate-fadeIn">
              <IntegrationCode lastPrompt={lastPrompt} />
            </div>
          )}
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

export default App;
