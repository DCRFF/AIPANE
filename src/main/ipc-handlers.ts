import { ipcMain, BrowserWindow } from 'electron';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { loadSettings, saveSettings, loadWindowState, saveWindowState } from './store.js';
import {
  createAllViews,
  addPanelAndSave,
  removePanelAndSave,
  navigateAndSave,
  applyLayout,
  goBackView,
  goForwardView,
  reloadView,
} from './view-manager.js';
import type { AppSettings, PanelConfig, LayoutItem } from '../shared/types.js';

export function registerIpc(mainWindow: BrowserWindow): void {
  let settings = loadSettings();
  let settingsWindow: BrowserWindow | null = null;

  function broadcast() {
    mainWindow.webContents.send('settings:changed', settings);
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.webContents.send('settings:changed', settings);
    }
  }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('settings:init', settings);
  });

  ipcMain.handle('settings:get', () => settings);

  ipcMain.handle('settings:update', (_event, newSettings: AppSettings) => {
    settings = { ...newSettings };
    saveSettings(settings);
    applyLayout(settings, mainWindow);
    broadcast();
  });

  ipcMain.handle('panel:add', (_event, url: string) => {
    const config: PanelConfig = { id: uuid(), url };
    settings = addPanelAndSave(config, settings, mainWindow);
    saveSettings(settings);
    broadcast();
    return settings;
  });

  ipcMain.handle('panel:remove', (_event, id: string) => {
    settings = removePanelAndSave(id, settings, mainWindow);
    saveSettings(settings);
    broadcast();
    return settings;
  });

  ipcMain.handle('panel:navigate', (_event, id: string, url: string) => {
    settings = navigateAndSave(id, url, settings);
    saveSettings(settings);
    broadcast();
    return settings;
  });

  ipcMain.handle('panel:goBack', (_event, id: string) => {
    goBackView(id);
  });

  ipcMain.handle('panel:goForward', (_event, id: string) => {
    goForwardView(id);
  });

  ipcMain.handle('panel:reload', (_event, id: string) => {
    reloadView(id);
  });

  ipcMain.handle('settings:toggle', () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close();
      settingsWindow = null;
      return;
    }
    const { x: cx, y: cy, width: mw, height: mh } = mainWindow.getContentBounds();
    const toolbarH = 48;
    const preloadPath = path.join(import.meta.dirname!, '../preload/index.js');
    settingsWindow = new BrowserWindow({
      x: cx + mw - 384,
      y: cy + toolbarH,
      width: 384,
      height: mh - toolbarH,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      parent: mainWindow,
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
      },
    });
    settingsWindow.loadFile(path.join(import.meta.dirname!, '../settings/index.html'));
    settingsWindow.on('closed', () => { settingsWindow = null; });
  });

  ipcMain.handle('settings:close', () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close();
      settingsWindow = null;
    }
  });

  ipcMain.on('layout:update', (_event, items: LayoutItem[]) => {
    applyLayout(settings, mainWindow);
  });

  mainWindow.on('close', () => {
    const bounds = mainWindow.getBounds();
    saveWindowState(bounds);
  });
}
