import React, { useState } from 'react';
import { IntegrationPlatform } from '../types';
import { Copy, Check, Terminal, Code2, Settings } from 'lucide-react';

const INTEGRATIONS: IntegrationPlatform[] = [
  {
    id: 'curl',
    name: 'cURL / Shell',
    icon: 'Terminal',
    template: ({ prompt, mimeType }) => `curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=$API_KEY" \\
-H 'Content-Type: application/json' \\
-d '{
  "contents": [{
    "parts": [
      {"text": "${prompt}"},
      {"inline_data": {
        "mime_type": "${mimeType}",
        "data": "BASE64_IMAGE_DATA"
      }}
    ]
  }]
}'`
  },
  {
    id: 'nodejs',
    name: 'Node.js (Google GenAI SDK)',
    icon: 'Code2',
    template: ({ prompt, mimeType }) => `import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function generateMockup() {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType: '${mimeType}', data: base64ImageString } },
        { text: '${prompt}' }
      ]
    }
  });
  
  console.log(response.text);
}`
  },
  {
    id: 'python',
    name: 'Python',
    icon: 'Code2',
    template: ({ prompt, mimeType }) => `import os
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["API_KEY"])

response = client.models.generate_content(
    model="gemini-2.5-flash-image",
    contents=[
        types.Part.from_bytes(image_bytes, "${mimeType}"),
        "${prompt}"
    ]
)

print(response.text)`
  }
];

const MIME_TYPES = [
  { value: 'image/png', label: 'PNG Image' },
  { value: 'image/jpeg', label: 'JPEG Image' },
  { value: 'image/webp', label: 'WebP Image' },
  { value: 'image/heic', label: 'HEIC Image' },
];

interface IntegrationCodeProps {
  lastPrompt?: string;
}

export const IntegrationCode: React.FC<IntegrationCodeProps> = ({ lastPrompt }) => {
  const [selectedPlatform, setSelectedPlatform] = useState(INTEGRATIONS[0]);
  const [selectedMimeType, setSelectedMimeType] = useState('image/png');
  const [copied, setCopied] = useState(false);

  const promptToUse = lastPrompt || "A futuristic product shot...";
  const codeSnippet = selectedPlatform.template({ 
    prompt: promptToUse, 
    imageBase64: null, 
    mimeType: selectedMimeType 
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-4">Connect via API</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Extend your merch workflow to other platforms. Copy the pre-configured code snippets below to automate generation on ChatGPT, Replit, or your own backend.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
        <div className="flex border-b border-slate-700 bg-slate-800/50">
           {INTEGRATIONS.map(platform => (
             <button
               key={platform.id}
               onClick={() => setSelectedPlatform(platform)}
               className={`px-6 py-4 flex items-center gap-2 font-medium transition-colors ${selectedPlatform.id === platform.id ? 'bg-slate-900 text-blue-400 border-t-2 border-t-blue-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
             >
               {platform.id === 'curl' ? <Terminal className="w-4 h-4" /> : <Code2 className="w-4 h-4" />}
               {platform.name}
             </button>
           ))}
        </div>

        {/* Configuration Toolbar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <Settings className="w-4 h-4 text-slate-500" />
             <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Input Image Format:</label>
             <select 
               value={selectedMimeType}
               onChange={(e) => setSelectedMimeType(e.target.value)}
               className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-1.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
             >
               {MIME_TYPES.map(t => (
                 <option key={t.value} value={t.value}>{t.label} ({t.value})</option>
               ))}
             </select>
           </div>
        </div>

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
        
        <div className="bg-slate-800/50 p-4 border-t border-slate-700 text-xs text-slate-500 flex justify-between items-center">
           <span>* Requires valid GOOGLE_API_KEY environment variable</span>
           <span className="flex items-center gap-1">
             Ready for:
             <span className="bg-slate-700 px-1.5 rounded text-slate-300">Replit</span>
             <span className="bg-slate-700 px-1.5 rounded text-slate-300">Vercel</span>
             <span className="bg-slate-700 px-1.5 rounded text-slate-300">Supabase</span>
           </span>
        </div>
      </div>
    </div>
  );
};