"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Electron Preload — The IPC Binding Bridge
 *
 * This script runs in a privileged context BEFORE the renderer (web page) loads.
 * It uses `contextBridge` to safely expose a controlled set of OS-level APIs
 * to our React app, without giving the web app full Node.js access (which
 * would be a security vulnerability).
 *
 * In the React app, access these via:  window.electronAPI.someMethod()
 */
const electron_1 = require("electron");
// The safe API surface we expose to the React renderer
const electronAPI = {
    // ── Window Controls (for our custom frameless title bar) ──────
    window: {
        minimize: () => electron_1.ipcRenderer.invoke('window:minimize'),
        maximize: () => electron_1.ipcRenderer.invoke('window:maximize'),
        close: () => electron_1.ipcRenderer.invoke('window:close'),
        isMaximized: () => electron_1.ipcRenderer.invoke('window:is-maximized'),
        onMaximizeChange: (callback) => {
            electron_1.ipcRenderer.on('window:maximize-changed', (_e, val) => callback(val));
        },
    },
    // ── File System (payroll exports, reports) ─────────────────────
    fs: {
        /** Opens a native Save dialog and returns the chosen file path */
        saveDialog: (opts) => electron_1.ipcRenderer.invoke('dialog:save-file', opts),
        /** Writes a string/Buffer to disk at the given path */
        writeFile: (filePath, data) => electron_1.ipcRenderer.invoke('fs:write-file', { filePath, data }),
    },
    // ── Native Notifications ────────────────────────────────────────
    notify: {
        /** Sends a native OS desktop notification */
        send: (title, body) => electron_1.ipcRenderer.invoke('notify:send', { title, body }),
    },
    // ── App Metadata ────────────────────────────────────────────────
    app: {
        getVersion: () => electron_1.ipcRenderer.invoke('app:get-version'),
        getPath: (name) => electron_1.ipcRenderer.invoke('app:get-path', name),
    },
    // ── Shell / Browser ─────────────────────────────────────────────
    shell: {
        /** Opens a URL in the user's default web browser */
        openExternal: (url) => electron_1.ipcRenderer.invoke('shell:open-external', url),
    },
    // ── Platform detection ─────────────────────────────────────────
    platform: process.platform,
    // ── Is this actually running inside Electron? ──────────────────
    isElectron: true,
};
// Expose the API to the renderer under window.electronAPI
electron_1.contextBridge.exposeInMainWorld('electronAPI', electronAPI);
