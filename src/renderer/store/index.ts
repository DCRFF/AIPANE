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
  setSettings: (settings) => set({ panels: settings.panels, layoutMode: settings.layoutMode, panelRatios: settings.panelRatios, rowRatios: settings.rowRatios ?? [], panelOrder: settings.panelOrder ?? [], aiServices: settings.aiServices ?? [] }),
  setRowRatios: (ratios) => set({ rowRatios: ratios }),
  setAiServices: (services) => set({ aiServices: services }),
}));
