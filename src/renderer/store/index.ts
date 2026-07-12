import { create } from 'zustand';
import type { AppSettings } from '../../shared/types';

interface LayoutStore extends AppSettings {
  setSettings: (settings: AppSettings) => void;
  setRowRatios: (ratios: number[]) => void;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  panels: [],
  layoutMode: 'horizontal',
  panelRatios: [],
  rowRatios: [],
  setSettings: (settings) => set({ panels: settings.panels, layoutMode: settings.layoutMode, panelRatios: settings.panelRatios, rowRatios: settings.rowRatios ?? [] }),
  setRowRatios: (ratios) => set({ rowRatios: ratios }),
}));
