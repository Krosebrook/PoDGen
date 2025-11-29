export interface MerchProduct {
  id: string;
  name: string;
  description: string;
  defaultPrompt: string;
  placeholderImage: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  type: 'edit' | 'merch';
}

export interface IntegrationTemplateParams {
  prompt: string;
  imageBase64: string | null;
  mimeType: string;
  webhookUrl?: string;
}

export interface IntegrationPlatform {
  id: string;
  name: string;
  icon: string; // Storing icon name as string to allow dynamic rendering if needed, or component
  template: (params: IntegrationTemplateParams) => string;
}

export enum AppMode {
  EDITOR = 'EDITOR',
  MERCH = 'MERCH',
  INTEGRATIONS = 'INTEGRATIONS'
}
