import { contextBridge, ipcRenderer } from 'electron';
import type { AppSettings, LayoutItem } from '../shared/types.js';

const api = {
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: AppSettings): Promise<void> =>
    ipcRenderer.invoke('settings:update', settings),
  addPanel: (url: string): Promise<AppSettings> => ipcRenderer.invoke('panel:add', url),
  removePanel: (id: string): Promise<AppSettings> => ipcRenderer.invoke('panel:remove', id),
  navigate: (id: string, url: string): Promise<AppSettings> =>
    ipcRenderer.invoke('panel:navigate', id, url),
  goBack: (id: string): Promise<void> => ipcRenderer.invoke('panel:goBack', id),
  goForward: (id: string): Promise<void> => ipcRenderer.invoke('panel:goForward', id),
  reload: (id: string): Promise<void> => ipcRenderer.invoke('panel:reload', id),
  updateLayout: (items: LayoutItem[]): void => ipcRenderer.send('layout:update', items),
  toggleSettings: (): Promise<void> => ipcRenderer.invoke('settings:toggle'),
  closeSettings: (): Promise<void> => ipcRenderer.invoke('settings:close'),
  onSettingsInit: (callback: (settings: AppSettings) => void): void => {
    ipcRenderer.on('settings:init', (_event, settings) => callback(settings));
  },
  onSettingsChanged: (callback: (settings: AppSettings) => void): void => {
    ipcRenderer.on('settings:changed', (_event, settings) => callback(settings));
  },
};

contextBridge.exposeInMainWorld('api', api);
