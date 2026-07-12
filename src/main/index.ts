import { app, BrowserWindow, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadWindowState } from './store.js';
import { registerIpc } from './ipc-handlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const winState = loadWindowState();
  const mainWindow = new BrowserWindow({
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

  registerIpc(mainWindow);

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(path.join(__dirname, '../../resources/icon.png'));
  }
  // 伪装为普通 Chrome，避免部分网站检测到 Electron 环境后拦截
  session.defaultSession.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  );
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
