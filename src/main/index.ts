import { app, BrowserWindow, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadWindowState } from './store.js';
import { setupGlobalIpc, setupWindowEvents } from './ipc-handlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let ipcReady = false;

function createWindow() {
  if (!ipcReady) return;
  if (mainWindow && !mainWindow.isDestroyed()) return;

  const winState = loadWindowState();
  mainWindow = new BrowserWindow({
    title: 'AIpane',
    icon: path.join(__dirname, '../../resources/icon.png'),
    x: winState.x,
    y: winState.y,
    width: winState.width,
    height: winState.height,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
    },
  });

  setupWindowEvents(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const loadPromise = process.env.VITE_DEV_SERVER_URL
    ? mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    : mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  loadPromise.then(() => {
    mainWindow?.show();
    mainWindow?.focus();
  }).catch((err) => {
    console.error('[main] Failed to load renderer:', err);
  });
}

app.whenReady().then(() => {
  setupGlobalIpc();
  ipcReady = true;
  if (process.platform === 'darwin' && app.dock) {
    try {
      app.dock.setIcon(path.join(__dirname, '../../resources/icon.png'));
    } catch {
      // asar 内路径不可直接访问，Dock 图标由 app 图标自动提供
    }
  }
  session.defaultSession.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  );
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  createWindow();
});
