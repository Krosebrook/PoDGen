
import React, { useState, Suspense } from 'react';
import { AppMode } from './shared/types';
import { Spinner } from './shared/components/ui/Spinner';
import { Shell } from './shared/components/layout/Shell';

// Lazy Load Features for Performance
const ImageEditor = React.lazy(() => import('./features/editor/components/ImageEditor').then(module => ({ default: module.ImageEditor })));
const MerchStudio = React.lazy(() => import('./features/merch/components/MerchStudio').then(module => ({ default: module.MerchStudio })));
const IntegrationCode = React.lazy(() => import('./features/integrations/components/IntegrationCode').then(module => ({ default: module.IntegrationCode })));

const LoadingScreen = () => (
  <div className="h-full w-full flex items-center justify-center min-h-[400px]">
    <Spinner className="w-8 h-8 text-blue-500" />
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppMode>('EDITOR');
  const [lastPrompt, setLastPrompt] = useState<string>("");

  const handleImageGenerated = (url: string, prompt: string) => {
    setLastPrompt(prompt);
  };

  return (
    <Shell activeTab={activeTab} onTabChange={setActiveTab}>
      <Suspense fallback={<LoadingScreen />}>
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
      </Suspense>
    </Shell>
  );
};

export default App;
