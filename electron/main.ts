import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  shell,
  dialog,
  Notification,
  nativeImage,
  protocol,
  net,
} from 'electron';
import path from 'path';
import { writeFileSync } from 'fs';
import { fork, ChildProcess } from 'child_process';

// ─── Environment ───────────────────────────────────────────────
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const PORT = 9002;
const NEXT_URL = `http://localhost:${PORT}`;
const PRELOAD_PATH = path.join(__dirname, 'preload.js');

let serverProcess: ChildProcess | null = null;

// ─── Globals ───────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// ─── App settings ──────────────────────────────────────────────
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('ignore-certificate-errors');

// ─── Single instance lock ──────────────────────────────────────
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// ─── Create Window ─────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    // Frameless window — we draw our own title bar in React
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0a0a0a',
      symbolColor: '#888888',
      height: 40,
    },
    backgroundColor: '#0a0a0a',
    show: false,                // don't show until content is ready
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      preload: PRELOAD_PATH,
      nodeIntegration: false,   // security: NO node in renderer
      contextIsolation: true,   // security: isolated context
      sandbox: false,
      webSecurity: !isDev,
    },
  });

  // ── Load app ───────────────────────────────────────────────
  if (isDev) {
    mainWindow.loadURL(NEXT_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // In production, we start the standalone server
    const serverPath = path.join(__dirname, '../.next/standalone/server.js');
    serverProcess = fork(serverPath, [], {
      env: { ...process.env, PORT: PORT.toString(), NODE_ENV: 'production' },
      stdio: 'ignore'
    });

    // Simple retry logic to wait for server to start
    const tryLoad = () => {
      mainWindow!.loadURL(NEXT_URL).catch(() => {
        setTimeout(tryLoad, 500);
      });
    };
    tryLoad();
  }

  // ── Show when ready ────────────────────────────────────────
  mainWindow.once('ready-to-show', () => {
    mainWindow!.show();
    // Fade in effect
    mainWindow!.setOpacity(0);
    let opacity = 0;
    const fadeIn = setInterval(() => {
      opacity += 0.05;
      if (opacity >= 1) {
        mainWindow!.setOpacity(1);
        clearInterval(fadeIn);
      } else {
        mainWindow!.setOpacity(opacity);
      }
    }, 16);
  });

  // ── Intercept close — minimize to tray instead ─────────────
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow!.hide();
      if (Notification.isSupported()) {
        new Notification({
          title: 'Falcon T25 is still running',
          body: 'The app is running in the system tray. Right-click the tray icon to quit.',
          icon: path.join(__dirname, '../public/favicon.ico'),
        }).show();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // ── Open external links in real browser ───────────────────
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// ─── System Tray ───────────────────────────────────────────────
function createTray() {
  const iconPath = path.join(__dirname, '../public/favicon.ico');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Falcon T25',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: 'Dashboard',
      click: () => {
        mainWindow?.show();
        mainWindow?.loadURL(`${NEXT_URL}/dashboard`);
      },
    },
    { type: 'separator' },
    {
      label: 'Check for Updates',
      click: () => {
        shell.openExternal('https://falcont25.com/releases');
      },
    },
    { type: 'separator' },
    {
      label: 'Quit Falcon T25',
      accelerator: 'Ctrl+Q',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Falcon T25 — AI Staff Recognition');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// ─── IPC Handlers (Bindings) ───────────────────────────────────

/** Window controls: called from the custom React title bar */
ipcMain.handle('window:minimize', () => mainWindow?.minimize());
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
  return mainWindow?.isMaximized();
});
ipcMain.handle('window:close', () => mainWindow?.hide());
ipcMain.handle('window:is-maximized', () => mainWindow?.isMaximized() ?? false);

/** File export: save dialog for payroll CSV / PDF */
ipcMain.handle('dialog:save-file', async (_event, { defaultName, filters }) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: defaultName,
    filters: filters || [
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'PDF Files', extensions: ['pdf'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  return result;
});

ipcMain.handle('fs:write-file', async (_event, { filePath, data }) => {
  try {
    writeFileSync(filePath, data, 'utf-8');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

/** Native desktop notification */
ipcMain.handle('notify:send', (_event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});

/** App info */
ipcMain.handle('app:get-version', () => app.getVersion());
ipcMain.handle('app:get-path', (_event, name: string) => app.getPath(name as any));

/** Open URL in default browser */
ipcMain.handle('shell:open-external', (_event, url: string) => shell.openExternal(url));

// ─── App lifecycle ─────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // On Windows/Linux, keep running in tray
    // app.quit() is only called via isQuitting flag
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  if (serverProcess) serverProcess.kill();
});
