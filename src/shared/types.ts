export interface PanelConfig {
  id: string;
  name: string;
  url: string;
  zoom?: number;
}

export interface AppSettings {
  panels: PanelConfig[];
  layoutMode: 'horizontal' | 'vertical' | 'grid';
  panelRatios: number[];
}

export interface BrowserApi {
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: AppSettings): Promise<void>;
  addPanel(url: string): Promise<AppSettings>;
  removePanel(id: string): Promise<AppSettings>;
  navigate(id: string, url: string): Promise<AppSettings>;
  renamePanel(id: string, name: string): Promise<AppSettings>;
  onSettingsInit(callback: (settings: AppSettings) => void): void;
  onSettingsChanged(callback: (settings: AppSettings) => void): void;
}

declare global {
  interface Window {
    api: BrowserApi;
  }
}
