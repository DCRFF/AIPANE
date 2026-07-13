import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { app } from 'electron';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { AppSettings } from '../shared/types.js';

interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
}

interface ConfigData {
  settings: AppSettings;
  windowState: WindowState;
}

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');

function getDefaults(): ConfigData {
  return {
    settings: {
      panels: [
        { id: randomUUID(), name: '豆包', url: 'https://www.doubao.com/' },
        { id: randomUUID(), name: 'DeepSeek', url: 'https://chat.deepseek.com/' },
      ],
      layoutMode: 'horizontal' as const,
      panelRatios: [0.5, 0.5],
      rowRatios: [],
      panelOrder: [0, 1],
      aiServices: [],
    },
    windowState: { width: 1400, height: 900 },
  };
}

function readConfig(): ConfigData {
  const defaults = getDefaults();
  if (!existsSync(CONFIG_PATH)) return defaults;
  try {
    const file = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
    return {
      ...defaults,
      ...file,
      settings: { ...defaults.settings, ...file.settings },
      windowState: { ...defaults.windowState, ...file.windowState },
    };
  } catch { return defaults; }
}

function writeConfig(data: ConfigData): void {
  const dir = path.dirname(CONFIG_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

let configCache = readConfig();

export function loadSettings(): AppSettings {
  const s = configCache.settings;
  return { ...s, aiServices: s.aiServices ?? [] };
}

export function saveSettings(settings: AppSettings): void {
  configCache = { ...configCache, settings };
  writeConfig(configCache);
}

export function loadWindowState(): WindowState {
  return configCache.windowState;
}

export function saveWindowState(state: WindowState): void {
  configCache = { ...configCache, windowState: state };
  writeConfig(configCache);
}
