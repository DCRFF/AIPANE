import { ipcMain, BrowserWindow } from 'electron';
import { randomUUID } from 'node:crypto';
import { loadSettings, saveSettings, loadWindowState, saveWindowState } from './store.js';
import type { AppSettings, AIService } from '../shared/types.js';

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
    settings = { ...s, aiServices: s.aiServices ?? settings.aiServices };
    saveSettings(settings);
    broadcastToAll('settings:changed', settings);
  });

  ipcMain.handle('panel:add', (_event, url: string, name?: string) => {
    if (settings.panels.length >= 6) return settings;
    const id = randomUUID();
    const panelName = name || `面板 ${settings.panels.length + 1}`;
    const newPanels = [...settings.panels, { id, name: panelName, url }];
    const panelRatios = newPanels.map(() => 1 / newPanels.length);
    const rowRatios = settings.layoutMode === 'grid' ? computeRowRatios(newPanels.length) : [];
    const panelOrder = [...settings.panelOrder, newPanels.length - 1];
    settings = { ...settings, panels: newPanels, panelRatios, rowRatios, panelOrder };
    saveSettings(settings);
    broadcastToAll('settings:changed', settings);
    return settings;
  });

  ipcMain.handle('panel:remove', (_event, id: string) => {
    if (settings.panels.length <= 1) return settings;
    const removedIdx = settings.panels.findIndex(p => p.id === id);
    if (removedIdx === -1) return settings;
    const newPanels = settings.panels.filter((p) => p.id !== id);
    const panelRatios = newPanels.map(() => 1 / newPanels.length);
    const rowRatios = settings.layoutMode === 'grid' ? computeRowRatios(newPanels.length) : [];
    const panelOrder = settings.panelOrder
        .filter(i => i !== removedIdx)
        .map(i => i > removedIdx ? i - 1 : i);
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

  // ── AI Services ──

  ipcMain.handle('ai-services:get', () => settings.aiServices ?? []);

  ipcMain.handle('ai-services:add', (_event, name: string, url: string) => {
    const trimmedName = name?.trim();
    const trimmedUrl = url?.trim();

    if (!trimmedName || trimmedName.length > 100) {
      return { error: '名称不能为空且不超过 100 字符' };
    }
    if (!trimmedUrl || !/^https?:\/\//.test(trimmedUrl)) {
      return { error: 'URL 必须以 http:// 或 https:// 开头' };
    }
    if ((settings.aiServices ?? []).length >= 100) {
      return { error: '自定义服务已达上限 (100)' };
    }

    try {
      const newService: AIService = {
        id: randomUUID(),
        name: trimmedName,
        url: trimmedUrl,
        source: 'user',
      };
      settings = {
        ...settings,
        aiServices: [...(settings.aiServices ?? []), newService],
      };
      saveSettings(settings);
      broadcastToAll('settings:changed', settings);
      return settings.aiServices;
    } catch (err) {
      return { error: '保存失败，请重试' };
    }
  });

  ipcMain.handle('ai-services:remove', (_event, id: string) => {
    const currentList = settings.aiServices ?? [];
    const idx = currentList.findIndex((s) => s.id === id);
    if (idx === -1) return { error: 'not found' };

    const newList = [...currentList];
    newList.splice(idx, 1);
    settings = { ...settings, aiServices: newList };
    saveSettings(settings);
    broadcastToAll('settings:changed', settings);
    return settings.aiServices;
  });

  ipcMain.handle('ai-services:edit', (_event, id: string, name: string, url: string) => {
    const currentList = settings.aiServices ?? [];
    const idx = currentList.findIndex((s) => s.id === id);
    if (idx === -1) return { error: 'not found' };

    const trimmedName = name?.trim();
    const trimmedUrl = url?.trim();
    if (!trimmedName || trimmedName.length > 100) {
      return { error: '名称不能为空且不超过 100 字符' };
    }
    if (!trimmedUrl || !/^https?:\/\//.test(trimmedUrl)) {
      return { error: 'URL 必须以 http:// 或 https:// 开头' };
    }

    const newList = currentList.map((s) =>
      s.id === id ? { ...s, name: trimmedName, url: trimmedUrl } : s
    );
    settings = { ...settings, aiServices: newList };
    saveSettings(settings);
    broadcastToAll('settings:changed', settings);
    return settings.aiServices;
  });

  ipcMain.handle('ai-services:reorder', (_event, ids: string[]) => {
    const currentList = settings.aiServices ?? [];
    const idSet = new Set(ids);
    const reordered = ids
      .map((id) => currentList.find((s) => s.id === id))
      .filter((s): s is AIService => s !== undefined);
    const rest = currentList.filter((s) => !idSet.has(s.id));
    settings = { ...settings, aiServices: [...reordered, ...rest] };
    saveSettings(settings);
    broadcastToAll('settings:changed', settings);
    return settings.aiServices;
  });
}

/** Register per-window events (called for each new window) */
export function setupWindowEvents(mainWindow: BrowserWindow): void {
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('settings:init', settings);
    mainWindow.webContents.executeJavaScript(
      `window.__INITIAL_SETTINGS__ = ${JSON.stringify(settings)};`
    );
  });

  mainWindow.on('close', () => {
    saveWindowState(mainWindow.getBounds());
  });
}
