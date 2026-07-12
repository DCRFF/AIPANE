import { contextBridge, ipcRenderer } from 'electron';
import type { AppSettings } from '../shared/types.js';

const api = {
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: AppSettings): Promise<void> => ipcRenderer.invoke('settings:update', settings),
  addPanel: (url: string, name?: string): Promise<AppSettings> => ipcRenderer.invoke('panel:add', url, name),
  removePanel: (id: string): Promise<AppSettings> => ipcRenderer.invoke('panel:remove', id),
  navigate: (id: string, url: string): Promise<AppSettings> => ipcRenderer.invoke('panel:navigate', id, url),
  renamePanel: (id: string, name: string): Promise<AppSettings> => ipcRenderer.invoke('panel:rename', id, name),
  onSettingsInit: (callback: (settings: AppSettings) => void): void => {
    ipcRenderer.on('settings:init', (_event, settings) => callback(settings));
  },
  onSettingsChanged: (callback: (settings: AppSettings) => void): void => {
    ipcRenderer.on('settings:changed', (_event, settings) => callback(settings));
  },
};

contextBridge.exposeInMainWorld('api', api);
