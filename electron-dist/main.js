"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
// ─── Environment ───────────────────────────────────────────────
const isDev = process.env.NODE_ENV === 'development' || !electron_1.app.isPackaged;
const NEXT_URL = 'http://localhost:9002';
const PRELOAD_PATH = path_1.default.join(__dirname, 'preload.js');
// ─── Globals ───────────────────────────────────────────────────
let mainWindow = null;
let tray = null;
let isQuitting = false;
// ─── App settings ──────────────────────────────────────────────
electron_1.app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
electron_1.app.commandLine.appendSwitch('ignore-certificate-errors');
// ─── Single instance lock ──────────────────────────────────────
if (!electron_1.app.requestSingleInstanceLock()) {
    electron_1.app.quit();
    process.exit(0);
}
electron_1.app.on('second-instance', () => {
    if (mainWindow) {
        if (mainWindow.isMinimized())
            mainWindow.restore();
        mainWindow.focus();
    }
});
// ─── Create Window ─────────────────────────────────────────────
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
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
        show: false, // don't show until content is ready
        icon: path_1.default.join(__dirname, '../public/favicon.ico'),
        webPreferences: {
            preload: PRELOAD_PATH,
            nodeIntegration: false, // security: NO node in renderer
            contextIsolation: true, // security: isolated context
            sandbox: false,
            webSecurity: !isDev,
        },
    });
    // ── Load app ───────────────────────────────────────────────
    if (isDev) {
        mainWindow.loadURL(NEXT_URL);
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
    else {
        // In production, Next.js is exported as static files
        mainWindow.loadURL(NEXT_URL);
    }
    // ── Show when ready ────────────────────────────────────────
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        // Fade in effect
        mainWindow.setOpacity(0);
        let opacity = 0;
        const fadeIn = setInterval(() => {
            opacity += 0.05;
            if (opacity >= 1) {
                mainWindow.setOpacity(1);
                clearInterval(fadeIn);
            }
            else {
                mainWindow.setOpacity(opacity);
            }
        }, 16);
    });
    // ── Intercept close — minimize to tray instead ─────────────
    mainWindow.on('close', (e) => {
        if (!isQuitting) {
            e.preventDefault();
            mainWindow.hide();
            if (electron_1.Notification.isSupported()) {
                new electron_1.Notification({
                    title: 'Falcon T25 is still running',
                    body: 'The app is running in the system tray. Right-click the tray icon to quit.',
                    icon: path_1.default.join(__dirname, '../public/favicon.ico'),
                }).show();
            }
        }
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    // ── Open external links in real browser ───────────────────
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: 'deny' };
    });
}
// ─── System Tray ───────────────────────────────────────────────
function createTray() {
    const iconPath = path_1.default.join(__dirname, '../public/favicon.ico');
    const icon = electron_1.nativeImage.createFromPath(iconPath);
    tray = new electron_1.Tray(icon.isEmpty() ? electron_1.nativeImage.createEmpty() : icon);
    const contextMenu = electron_1.Menu.buildFromTemplate([
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
                electron_1.shell.openExternal('https://falcont25.com/releases');
            },
        },
        { type: 'separator' },
        {
            label: 'Quit Falcon T25',
            accelerator: 'Ctrl+Q',
            click: () => {
                isQuitting = true;
                electron_1.app.quit();
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
electron_1.ipcMain.handle('window:minimize', () => mainWindow?.minimize());
electron_1.ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    }
    else {
        mainWindow?.maximize();
    }
    return mainWindow?.isMaximized();
});
electron_1.ipcMain.handle('window:close', () => mainWindow?.hide());
electron_1.ipcMain.handle('window:is-maximized', () => mainWindow?.isMaximized() ?? false);
/** File export: save dialog for payroll CSV / PDF */
electron_1.ipcMain.handle('dialog:save-file', async (_event, { defaultName, filters }) => {
    const result = await electron_1.dialog.showSaveDialog(mainWindow, {
        defaultPath: defaultName,
        filters: filters || [
            { name: 'CSV Files', extensions: ['csv'] },
            { name: 'PDF Files', extensions: ['pdf'] },
            { name: 'All Files', extensions: ['*'] },
        ],
    });
    return result;
});
electron_1.ipcMain.handle('fs:write-file', async (_event, { filePath, data }) => {
    try {
        (0, fs_1.writeFileSync)(filePath, data, 'utf-8');
        return { success: true };
    }
    catch (err) {
        return { success: false, error: err.message };
    }
});
/** Native desktop notification */
electron_1.ipcMain.handle('notify:send', (_event, { title, body }) => {
    if (electron_1.Notification.isSupported()) {
        new electron_1.Notification({ title, body }).show();
    }
});
/** App info */
electron_1.ipcMain.handle('app:get-version', () => electron_1.app.getVersion());
electron_1.ipcMain.handle('app:get-path', (_event, name) => electron_1.app.getPath(name));
/** Open URL in default browser */
electron_1.ipcMain.handle('shell:open-external', (_event, url) => electron_1.shell.openExternal(url));
// ─── App lifecycle ─────────────────────────────────────────────
electron_1.app.whenReady().then(() => {
    createWindow();
    createTray();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // On Windows/Linux, keep running in tray
        // app.quit() is only called via isQuitting flag
    }
});
electron_1.app.on('before-quit', () => {
    isQuitting = true;
});
