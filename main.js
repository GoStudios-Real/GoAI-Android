const { app, BrowserWindow, shell, session } = require('electron');
const path = require('path');

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

  function createWindow() {
    const win = new BrowserWindow({
      width: 1280,
      height: 820,
      minWidth: 960,
      minHeight: 620,
      title: 'Gaming GoAI - the AI for GoConsoleOS',
      backgroundColor: '#07020f',
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        allowRunningInsecureContent: false
      }
    });

    win.loadFile('index.html');
    win.webContents.setWindowOpenHandler(({ url }) => {
      if (url.indexOf('http') === 0 || url.indexOf('mailto:') === 0) {
        shell.openExternal(url);
      }
      return { action: 'deny' };
    });

    win.webContents.on('will-navigate', (event, url) => {
      if (url.indexOf('http') === 0 && url.indexOf('file://') !== 0) {
        event.preventDefault();
        shell.openExternal(url);
      }
    });
  }

  app.whenReady().then(() => {
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      const allowed = ['geolocation', 'notifications', 'clipboard-sanitized-write', 'media'];
      callback(allowed.indexOf(permission) >= 0);
    });
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    app.quit();
  });
}