export interface MerchProduct {
  id: string;
  name: string;
  description: string;
  defaultPrompt: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  type: 'edit' | 'merch';
}

export interface IntegrationPlatform {
  id: string;
  name: string;
  icon: string;
  template: (data: { prompt: string; imageBase64: string | null; mimeType: string }) => string;
}

export enum AppMode {
  EDITOR = 'EDITOR',
  MERCH = 'MERCH',
  INTEGRATIONS = 'INTEGRATIONS'
}