'use client';

/**
 * useElectronExport
 *
 * A React hook that provides native OS file export capabilities when
 * running inside Electron. Falls back to browser download when on the web.
 *
 * Usage:
 *   const { exportFile, isElectron } = useElectronExport();
 *   await exportFile('payroll-june.csv', csvData);
 */
export function useElectronExport() {
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.isElectron;

  /**
   * Export a file. In Electron: opens a native Save dialog.
   * In browser: triggers a standard download.
   */
  const exportFile = async (
    defaultName: string,
    data: string,
    mimeType = 'text/csv',
    filters?: { name: string; extensions: string[] }[]
  ): Promise<{ success: boolean; path?: string; cancelled?: boolean }> => {
    if (isElectron && window.electronAPI) {
      // ── Electron path: native Save dialog ──────────────────
      const result = await window.electronAPI.fs.saveDialog({ defaultName, filters });

      if (result.canceled || !result.filePath) {
        return { success: false, cancelled: true };
      }

      const writeResult = await window.electronAPI.fs.writeFile(result.filePath, data);
      if (writeResult.success) {
        // Send a native notification to confirm the export
        await window.electronAPI.notify.send(
          'Export Complete',
          `File saved: ${result.filePath}`
        );
      }
      return { success: writeResult.success, path: result.filePath };
    } else {
      // ── Browser fallback: Blob download ───────────────────
      try {
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = defaultName;
        a.click();
        URL.revokeObjectURL(url);
        return { success: true };
      } catch {
        return { success: false };
      }
    }
  };

  /**
   * Send a native OS desktop notification.
   * Falls back to browser Notification API on the web.
   */
  const sendNotification = async (title: string, body: string) => {
    if (isElectron && window.electronAPI) {
      await window.electronAPI.notify.send(title, body);
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  return { exportFile, sendNotification, isElectron };
}
