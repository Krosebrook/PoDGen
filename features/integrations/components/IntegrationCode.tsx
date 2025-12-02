import React, { useState } from 'react';
import { INTEGRATION_PLATFORMS, MIME_TYPES, IntegrationPlatform } from '../data/platforms';
import { Copy, Check, Terminal, Code2, Settings, FileType, Share2 } from 'lucide-react';
import { Card, Input, Badge } from '@/shared/components/ui';

interface IntegrationCodeProps {
  lastPrompt?: string;
}

export const IntegrationCode: React.FC<IntegrationCodeProps> = ({ lastPrompt }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<IntegrationPlatform>(INTEGRATION_PLATFORMS[0]);
  const [selectedMimeType, setSelectedMimeType] = useState('image/png');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const promptToUse = lastPrompt || "A futuristic product shot...";
  
  const codeSnippet = selectedPlatform.template({ 
    prompt: promptToUse, 
    imageBase64: null, 
    mimeType: selectedMimeType,
    webhookUrl: webhookUrl
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMimeLabel = (mime: string) => {
    const type = MIME_TYPES.find(t => t.value === mime);
    return type ? type.label.split(' ')[0] : 'IMG';
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Terminal': return <Terminal className="w-4 h-4" />;
      case 'Code2': return <Code2 className="w-4 h-4" />;
      case 'Share2': return <Share2 className="w-4 h-4" />;
      default: return <Code2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-4">Connect via API</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Extend your merch workflow to other platforms. Copy the pre-configured code snippets below.
        </p>
      </div>

      <Card className="shadow-2xl" noPadding>
        {/* Platform Selector */}
        <div className="flex border-b border-slate-700 bg-slate-800/50 overflow-x-auto">
           {INTEGRATION_PLATFORMS.map(platform => (
             <button
               key={platform.id}
               onClick={() => setSelectedPlatform(platform)}
               className={`px-6 py-4 flex items-center gap-2 font-medium transition-colors whitespace-nowrap ${selectedPlatform.id === platform.id ? 'bg-slate-900 text-blue-400 border-t-2 border-t-blue-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
             >
               {renderIcon(platform.icon)}
               {platform.name}
             </button>
           ))}
        </div>

        {/* Configuration Toolbar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
           {/* General Settings */}
           <div className="flex items-center gap-3">
             <Settings className="w-4 h-4 text-slate-500" />
             <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Format:</label>
             <div className="flex items-center gap-2">
               <select 
                 value={selectedMimeType}
                 onChange={(e) => setSelectedMimeType(e.target.value)}
                 className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-1.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
               >
                 {MIME_TYPES.map(t => (
                   <option key={t.value} value={t.value}>{t.label} ({t.value})</option>
                 ))}
               </select>

               <Badge variant="indigo" icon={<FileType className="w-3 h-3" />}>
                 {getMimeLabel(selectedMimeType)}
               </Badge>
             </div>
           </div>

           {/* Discord Specific Settings */}
           {selectedPlatform.id === 'discord' && (
             <div className="flex items-center gap-2 flex-1 md:justify-end animate-fadeIn">
                <Input 
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="md:w-64"
                />
             </div>
           )}
        </div>

        {/* Code View */}
        <div className="p-6 relative group">
           <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={handleCopy}
                className="bg-slate-700/50 hover:bg-blue-600/90 text-white p-2 rounded-md transition-all flex items-center gap-2 text-xs border border-slate-600 hover:border-blue-500"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
           </div>
           
           <pre className="font-mono text-sm text-blue-100/90 overflow-x-auto p-4 bg-slate-950 rounded-lg border border-slate-800">
             <code>{codeSnippet}</code>
           </pre>
        </div>
      </Card>
    </div>
  );
};
