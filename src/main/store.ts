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
        { id: uuid(), name: '豆包', url: 'https://www.doubao.com/' },
        { id: uuid(), name: 'DeepSeek', url: 'https://chat.deepseek.com/' },
      ],
      layoutMode: 'horizontal' as const,
      panelRatios: [0.5, 0.5],
      rowRatios: [],
      panelOrder: [0, 1],
      aiServices: [],
    },
    windowState: { width: 1400, height: 900 },
  },
});

export function loadSettings(): AppSettings {
  const s = store.get('settings');
  return { ...s, aiServices: s.aiServices ?? [] };
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
