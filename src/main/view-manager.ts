import { BrowserView, BrowserWindow } from 'electron';
import { v4 as uuid } from 'uuid';
import type { AppSettings, PanelConfig, LayoutItem } from '../shared/types.js';


const views = new Map<string, BrowserView>();

export function createAllViews(settings: AppSettings, mainWindow: BrowserWindow): void {
  for (const panel of settings.panels) {
    addView(panel, mainWindow);
  }
  applyLayout(settings, mainWindow);
}

export function addView(config: PanelConfig, mainWindow: BrowserWindow): BrowserView {
  const view = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.addBrowserView(view);
  view.webContents.loadURL(config.url);
  views.set(config.id, view);
  return view;
}

export function removeView(id: string, mainWindow: BrowserWindow): void {
  const view = views.get(id);
  if (view) {
    mainWindow.removeBrowserView(view);
    views.delete(id);
  }
}

export function navigateView(id: string, url: string): void {
  const view = views.get(id);
  if (view) {
    view.webContents.loadURL(url);
  }
}

export function applyLayout(settings: AppSettings, mainWindow: BrowserWindow): void {
  const contentBounds = mainWindow.getContentBounds();
  const toolbarHeight = 48;
  const availableWidth = contentBounds.width;
  const availableHeight = contentBounds.height - toolbarHeight;
  const { panels, panelRatios, layoutMode } = settings;

  if (layoutMode === 'horizontal') {
    panels.forEach((panel, i) => {
      const view = views.get(panel.id);
      if (!view) return;
      const ratio = panelRatios[i] ?? 1 / panels.length;
      const x = panelRatios.slice(0, i).reduce((sum, r) => sum + r, 0) * availableWidth;
      view.setBounds({
        x: Math.round(x),
        y: toolbarHeight,
        width: Math.round(availableWidth * ratio),
        height: availableHeight,
      });
    });
  } else if (layoutMode === 'vertical') {
    panels.forEach((panel, i) => {
      const view = views.get(panel.id);
      if (!view) return;
      const ratio = panelRatios[i] ?? 1 / panels.length;
      const y = panelRatios.slice(0, i).reduce((sum, r) => sum + r, 0) * availableHeight + toolbarHeight;
      view.setBounds({
        x: 0,
        y: Math.round(y),
        width: availableWidth,
        height: Math.round(availableHeight * ratio),
      });
    });
  } else {
    // grid
    const count = panels.length;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const cellW = Math.round(availableWidth / cols);
    const cellH = Math.round(availableHeight / rows);
    panels.forEach((panel, i) => {
      const view = views.get(panel.id);
      if (!view) return;
      const col = i % cols;
      const row = Math.floor(i / cols);
      view.setBounds({
        x: col * cellW,
        y: row * cellH + toolbarHeight,
        width: cellW,
        height: cellH,
      });
    });
  }
}

export function addPanelAndSave(config: PanelConfig, settings: AppSettings, mainWindow: BrowserWindow): AppSettings {
  addView(config, mainWindow);
  const newPanels = [...settings.panels, config];
  const newRatios = newPanels.map(() => 1 / newPanels.length);
  return { ...settings, panels: newPanels, panelRatios: newRatios };
}

export function removePanelAndSave(id: string, settings: AppSettings, mainWindow: BrowserWindow): AppSettings {
  removeView(id, mainWindow);
  const newPanels = settings.panels.filter((p) => p.id !== id);
  const newRatios = newPanels.length > 0 ? newPanels.map(() => 1 / newPanels.length) : [];
  return { ...settings, panels: newPanels, panelRatios: newRatios };
}

export function navigateAndSave(id: string, url: string, settings: AppSettings): AppSettings {
  navigateView(id, url);
  return {
    ...settings,
    panels: settings.panels.map((p) => (p.id === id ? { ...p, url } : p)),
  };
}

export function goBackView(id: string): void {
  const view = views.get(id);
  if (view && view.webContents.canGoBack()) {
    view.webContents.goBack();
  }
}

export function goForwardView(id: string): void {
  const view = views.get(id);
  if (view && view.webContents.canGoForward()) {
    view.webContents.goForward();
  }
}

export function reloadView(id: string): void {
  const view = views.get(id);
  view?.webContents.reload();
}

