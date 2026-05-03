/**
 * Global type augmentation for the Electron IPC bridge.
 * This gives the React app full TypeScript IntelliSense for window.electronAPI.
 */

interface ElectronWindowAPI {
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<boolean>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
    onMaximizeChange: (callback: (isMaximized: boolean) => void) => void;
  };
  fs: {
    saveDialog: (opts: {
      defaultName: string;
      filters?: { name: string; extensions: string[] }[];
    }) => Promise<Electron.SaveDialogReturnValue>;
    writeFile: (filePath: string, data: string) => Promise<{ success: boolean; error?: string }>;
  };
  notify: {
    send: (title: string, body: string) => Promise<void>;
  };
  app: {
    getVersion: () => Promise<string>;
    getPath: (name: string) => Promise<string>;
  };
  shell: {
    openExternal: (url: string) => Promise<void>;
  };
  platform: 'win32' | 'darwin' | 'linux';
  isElectron: boolean;
}

declare global {
  interface Window {
    /**
     * Available only when the app is running inside Electron.
     * Always check `window.electronAPI?.isElectron` before calling.
     */
    electronAPI?: ElectronWindowAPI;
  }
}

export {};
