import { create } from 'zustand';
import type { AppSettings } from '../../shared/types';

interface LayoutStore extends AppSettings {
  setSettings: (settings: AppSettings) => void;
  setLayoutDirection: (dir: 'horizontal' | 'vertical') => void;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  panels: [],
  layoutDirection: 'horizontal',
  panelRatios: [],

  setSettings: (settings) =>
    set({
      panels: settings.panels,
      layoutDirection: settings.layoutDirection,
      panelRatios: settings.panelRatios,
    }),

  setLayoutDirection: (dir) => set({ layoutDirection: dir }),
}));
