import { create } from 'zustand';
import type { AppSettings, AIService } from '../../shared/types';

interface LayoutStore extends AppSettings {
  setSettings: (settings: AppSettings) => void;
  setRowRatios: (ratios: number[]) => void;
  aiServices: AIService[];
  setAiServices: (services: AIService[]) => void;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  panels: [],
  layoutMode: 'horizontal',
  panelRatios: [],
  rowRatios: [],
  panelOrder: [],
  aiServices: [],
  setSettings: (settings) => {
    const p = settings.panels;
    const order = settings.panelOrder?.length === p.length ? settings.panelOrder : p.map((_, i) => i);
    const ratios = settings.panelRatios?.length === p.length ? settings.panelRatios : p.map(() => 1 / p.length);
    set({ panels: p, layoutMode: settings.layoutMode, panelRatios: ratios, rowRatios: settings.rowRatios ?? [], panelOrder: order, aiServices: settings.aiServices ?? [] });
  },
  setRowRatios: (ratios) => set({ rowRatios: ratios }),
  setAiServices: (services) => set({ aiServices: services }),
}));
