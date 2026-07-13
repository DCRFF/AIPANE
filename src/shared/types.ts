export interface PanelConfig {
  id: string;
  name: string;
  url: string;
  zoom?: number;
}

export interface AIService {
  id: string;
  name: string;
  url: string;
  source: 'builtin' | 'user';
  icon?: string;
  enabled?: boolean;
}

export interface AppSettings {
  panels: PanelConfig[];
  layoutMode: 'horizontal' | 'vertical' | 'grid';
  panelRatios: number[];
  rowRatios: number[];
  panelOrder: number[];
  aiServices?: AIService[];
}

export interface BrowserApi {
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: AppSettings): Promise<void>;
  addPanel(url: string, name?: string): Promise<AppSettings>;
  removePanel(id: string): Promise<AppSettings>;
  navigate(id: string, url: string): Promise<AppSettings>;
  renamePanel(id: string, name: string): Promise<AppSettings>;
  onSettingsInit(callback: (settings: AppSettings) => void): void;
  onSettingsChanged(callback: (settings: AppSettings) => void): void;
  getAiServices(): Promise<AIService[]>;
  addAiService(name: string, url: string): Promise<AIService[] | { error: string }>;
  removeAiService(id: string): Promise<AIService[] | { error: string }>;
  editAiService(id: string, name: string, url: string): Promise<AIService[] | { error: string }>;
  reorderAiServices(ids: string[]): Promise<AIService[] | { error: string }>;
}

declare global {
  interface Window {
    api: BrowserApi;
  }
}
