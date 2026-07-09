import Store from 'electron-store';
import { v4 as uuid } from 'uuid';
import type { AppSettings } from '../shared/types.js';
interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
}

const store = new Store<{ settings: AppSettings; windowState: WindowState }>({
  defaults: {
    settings: {
      panels: [
        { id: uuid(), url: 'https://www.doubao.com/' },
        { id: uuid(), url: 'https://chat.deepseek.com/' },
      ],
      layoutDirection: 'horizontal' as const,
      panelRatios: [0.5, 0.5],
    },
    windowState: { width: 1400, height: 900 },
  },
});

export function loadSettings(): AppSettings {
  return store.get('settings');
}

export function saveSettings(settings: AppSettings): void {
  store.set('settings', settings);
}

export function loadWindowState(): WindowState {
  return store.get('windowState');
}

export function saveWindowState(state: WindowState): void {
  store.set('windowState', state);
}
