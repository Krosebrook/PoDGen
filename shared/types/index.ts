
export type AppMode = 'EDITOR' | 'MERCH' | 'INTEGRATIONS';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  type: 'edit' | 'merch';
}
