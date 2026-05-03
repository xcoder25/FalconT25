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
import { contextBridge, ipcRenderer } from 'electron';

// The safe API surface we expose to the React renderer
const electronAPI = {
  // ── Window Controls (for our custom frameless title bar) ──────
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
    onMaximizeChange: (callback: (isMaximized: boolean) => void) => {
      ipcRenderer.on('window:maximize-changed', (_e, val) => callback(val));
    },
  },

  // ── File System (payroll exports, reports) ─────────────────────
  fs: {
    /** Opens a native Save dialog and returns the chosen file path */
    saveDialog: (opts: { defaultName: string; filters?: { name: string; extensions: string[] }[] }) =>
      ipcRenderer.invoke('dialog:save-file', opts),

    /** Writes a string/Buffer to disk at the given path */
    writeFile: (filePath: string, data: string) =>
      ipcRenderer.invoke('fs:write-file', { filePath, data }),
  },

  // ── Native Notifications ────────────────────────────────────────
  notify: {
    /** Sends a native OS desktop notification */
    send: (title: string, body: string) =>
      ipcRenderer.invoke('notify:send', { title, body }),
  },

  // ── App Metadata ────────────────────────────────────────────────
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    getPath: (name: string) => ipcRenderer.invoke('app:get-path', name),
  },

  // ── Shell / Browser ─────────────────────────────────────────────
  shell: {
    /** Opens a URL in the user's default web browser */
    openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url),
  },

  // ── Platform detection ─────────────────────────────────────────
  platform: process.platform as 'win32' | 'darwin' | 'linux',

  // ── Is this actually running inside Electron? ──────────────────
  isElectron: true,
};

// Expose the API to the renderer under window.electronAPI
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// TypeScript type declaration — copy this into a .d.ts file for IntelliSense
export type ElectronAPI = typeof electronAPI;
