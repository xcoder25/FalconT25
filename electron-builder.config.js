/**
 * electron-builder configuration for Falcon T25 Desktop
 * Produces platform-specific installers (.exe on Windows, .dmg on Mac)
 */
module.exports = {
  appId: 'com.falcont25.desktop',
  productName: 'Falcon T25',
  copyright: `Copyright © ${new Date().getFullYear()} Falcon T25`,

  // Point to the compiled electron files
  main: 'electron-dist/main.js',

  directories: {
    output: 'dist-electron',
    buildResources: 'build-assets',
  },

  files: [
    'electron-dist/**/*',
    '.next/standalone/**/*',
    '.next/static/**/*',
    'public/**/*',
    'package.json',
    'node_modules/**/*',
    '!node_modules/.cache',
    '!node_modules/electron',
    '!node_modules/electron-builder',
  ],

  // ── Windows (.exe NSIS installer) ────────────────────────────
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
    ],
    icon: 'public/favicon.ico',
    publisherName: 'Falcon T25 Inc.',
    verifyUpdateCodeSignature: false,
  },

  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Falcon T25',
    installerIcon: 'public/favicon.ico',
    uninstallerIcon: 'public/favicon.ico',
    installerHeaderIcon: 'public/favicon.ico',
    license: 'LICENSE',
  },

  // ── macOS (.dmg) ──────────────────────────────────────────────
  mac: {
    target: ['dmg', 'zip'],
    icon: 'public/favicon.ico',
    category: 'public.app-category.business',
    darkModeSupport: true,
  },

  dmg: {
    contents: [
      { x: 130, y: 220 },
      { x: 410, y: 220, type: 'link', path: '/Applications' },
    ],
  },

  // ── Linux ─────────────────────────────────────────────────────
  linux: {
    target: ['AppImage', 'deb'],
    icon: 'public/favicon.ico',
    category: 'Office',
  },

  // ── Auto-updater ─────────────────────────────────────────────
  publish: {
    provider: 'github',
    owner: 'your-org',
    repo: 'falcon-t25',
  },
};
