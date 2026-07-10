import { ipcMain, BrowserWindow } from 'electron';
import { v4 as uuid } from 'uuid';
import { loadSettings, saveSettings, loadWindowState, saveWindowState } from './store.js';
import type { AppSettings } from '../shared/types.js';

export function registerIpc(mainWindow: BrowserWindow): void {
  let settings = loadSettings();

  function broadcast() {
    mainWindow.webContents.send('settings:changed', settings);
  }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('settings:init', settings);
  });

  ipcMain.handle('settings:get', () => settings);

  ipcMain.handle('settings:update', (_event, s: AppSettings) => {
    settings = { ...s };
    saveSettings(settings);
    broadcast();
  });

  ipcMain.handle('panel:add', (_event, url: string) => {
    const id = uuid();
    const name = `面板 ${settings.panels.length + 1}`;
    settings = { ...settings, panels: [...settings.panels, { id, name, url }], panelRatios: settings.panels.map(() => 1 / (settings.panels.length + 1)) };
    saveSettings(settings);
    broadcast();
    return settings;
  });

  ipcMain.handle('panel:remove', (_event, id: string) => {
    const newPanels = settings.panels.filter((p) => p.id !== id);
    settings = { ...settings, panels: newPanels, panelRatios: newPanels.map(() => 1 / newPanels.length) };
    saveSettings(settings);
    broadcast();
    return settings;
  });

  ipcMain.handle('panel:navigate', (_event, id: string, url: string) => {
    settings = { ...settings, panels: settings.panels.map((p) => (p.id === id ? { ...p, url } : p)) };
    saveSettings(settings);
    broadcast();
    return settings;
  });

  ipcMain.handle('panel:rename', (_event, id: string, name: string) => {
    settings = { ...settings, panels: settings.panels.map((p) => (p.id === id ? { ...p, name } : p)) };
    saveSettings(settings);
    broadcast();
    return settings;
  });

  mainWindow.on('close', () => {
    saveWindowState(mainWindow.getBounds());
  });
}
