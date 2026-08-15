const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('goDesktop', {
  isDesktop: true,
  platform: process.platform
});