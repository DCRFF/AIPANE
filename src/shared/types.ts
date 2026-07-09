/** 面板配置 */
export interface PanelConfig {
  id: string;
  url: string;
  zoom?: number;
}

/** 应用设置 */
export interface AppSettings {
  panels: PanelConfig[];
  layoutDirection: 'horizontal' | 'vertical';
  panelRatios: number[];
}

/** 布局更新项 */
export interface LayoutItem {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
}

/** IPC 通道 */
export type IpcChannel =
  | 'settings:get'
  | 'settings:update'
  | 'panel:add'
  | 'panel:remove'
  | 'panel:navigate'
  | 'panel:goBack'
  | 'panel:goForward'
  | 'panel:reload'
  | 'layout:update';

/** Preload API 类型 */
export interface BrowserApi {
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: AppSettings): Promise<void>;
  addPanel(url: string): Promise<AppSettings>;
  removePanel(id: string): Promise<AppSettings>;
  goForward(id: string): Promise<void>;
  reload(id: string): Promise<void>;
  openSettings(): Promise<void>;
  closeSettings(): Promise<void>;
  updateLayout(items: LayoutItem[]): void;
  onSettingsInit(callback: (settings: AppSettings) => void): void;
  onSettingsChanged(callback: (settings: AppSettings) => void): void;
}

declare global {
  interface Window {
    api: BrowserApi;
  }
}
