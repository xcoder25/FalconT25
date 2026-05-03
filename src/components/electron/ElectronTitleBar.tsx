'use client';

import React, { useEffect, useState } from 'react';
import { Minus, Square, X, Maximize2 } from 'lucide-react';

/**
 * ElectronTitleBar
 *
 * A custom, frameless title bar rendered in React that calls the Electron
 * IPC bindings (window.electronAPI) to control the native OS window.
 * Only renders when running inside Electron.
 */
export function ElectronTitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.isElectron;

  useEffect(() => {
    if (!isElectron) return;
    // Sync initial state
    window.electronAPI!.window.isMaximized().then(setIsMaximized);
    // Listen for maximize/restore events
    window.electronAPI!.window.onMaximizeChange(setIsMaximized);
  }, [isElectron]);

  if (!isElectron) return null;

  const handleMinimize = () => window.electronAPI!.window.minimize();
  const handleMaximize = async () => {
    const max = await window.electronAPI!.window.maximize();
    setIsMaximized(max);
  };
  const handleClose = () => window.electronAPI!.window.close();

  return (
    <div
      className="h-10 flex items-center justify-between bg-[#0a0a0a] border-b border-white/[0.06] select-none z-50 shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* App identity */}
      <div className="flex items-center px-4 space-x-2">
        <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
          <span className="text-[8px] font-black text-white">F</span>
        </div>
        <span className="text-xs font-medium text-neutral-400 tracking-wider">
          FALCON T25
        </span>
        <span className="text-[10px] text-neutral-600 font-mono ml-2 hidden sm:block">
          Command Center
        </span>
      </div>

      {/* Window control buttons — no-drag zone */}
      <div
        className="flex items-center h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Minimize */}
        <button
          onClick={handleMinimize}
          title="Minimize"
          className="h-full w-12 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Maximize / Restore */}
        <button
          onClick={handleMaximize}
          title={isMaximized ? 'Restore' : 'Maximize'}
          className="h-full w-12 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
        >
          {isMaximized ? (
            <Square className="w-3 h-3" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Close — hover red */}
        <button
          onClick={handleClose}
          title="Close to tray"
          className="h-full w-12 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-red-600 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
