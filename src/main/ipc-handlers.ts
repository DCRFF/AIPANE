import { ipcMain, BrowserWindow } from 'electron';
import { v4 as uuid } from 'uuid';
import { loadSettings, saveSettings, loadWindowState, saveWindowState } from './store.js';
import type { AppSettings } from '../shared/types.js';

function computeRowRatios(panelCount: number): number[] {
  const cols = Math.ceil(Math.sqrt(panelCount));
  const rows = Math.ceil(panelCount / cols);
  return Array.from({ length: rows }, () => 1 / rows);
}

// ── Module-level settings (loaded once, mutated by IPC handlers) ──
let settings: AppSettings;

function broadcastToAll(content: string, data: unknown) {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) win.webContents.send(content, data);
  }
}

/** Register once — IPC handlers persist for app lifetime */
export function setupGlobalIpc(): void {
  settings = loadSettings();

  ipcMain.handle('settings:get', () => settings);

  ipcMain.handle('settings:update', (_event, s: AppSettings) => {
    settings = { ...s };
    saveSettings(settings);
    broadcastToAll('settings:changed', settings);
  });

  ipcMain.handle('panel:add', (_event, url: string, name?: string) => {
    const id = uuid();
    const panelName = name || `面板 ${settings.panels.length + 1}`;
    const newPanels = [...settings.panels, { id, name: panelName, url }];
    const panelRatios = newPanels.map(() => 1 / newPanels.length);
    const rowRatios = settings.layoutMode === 'grid' ? computeRowRatios(newPanels.length) : [];
    const panelOrder = newPanels.map((_, i) => i);
    settings = { ...settings, panels: newPanels, panelRatios, rowRatios, panelOrder };
    saveSettings(settings);
    broadcastToAll('settings:changed', settings);
    return settings;
  });

  ipcMain.handle('panel:remove', (_event, id: string) => {
    const newPanels = settings.panels.filter((p) => p.id !== id);
    const panelRatios = newPanels.map(() => 1 / newPanels.length);
    const rowRatios = settings.layoutMode === 'grid' ? computeRowRatios(newPanels.length) : [];
    const panelOrder = newPanels.map((_, i) => i);
    settings = { ...settings, panels: newPanels, panelRatios, rowRatios, panelOrder };
    saveSettings(settings);
    broadcastToAll('settings:changed', settings);
    return settings;
  });

  ipcMain.handle('panel:navigate', (_event, id: string, url: string) => {
    settings = { ...settings, panels: settings.panels.map((p) => (p.id === id ? { ...p, url } : p)) };
    saveSettings(settings);
    broadcastToAll('settings:changed', settings);
    return settings;
  });

  ipcMain.handle('panel:rename', (_event, id: string, name: string) => {
    settings = { ...settings, panels: settings.panels.map((p) => (p.id === id ? { ...p, name } : p)) };
    saveSettings(settings);
    broadcastToAll('settings:changed', settings);
    return settings;
  });
}

/** Register per-window events (called for each new window) */
export function setupWindowEvents(mainWindow: BrowserWindow): void {
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('settings:init', settings);
  });

  mainWindow.on('close', () => {
    saveWindowState(mainWindow.getBounds());
  });
}
