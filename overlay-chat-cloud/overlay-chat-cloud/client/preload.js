/**
 * Preload Script - Secure bridge between renderer and main process
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getConfig: () => ipcRenderer.invoke('get-config'),
    toggleMinimize: () => ipcRenderer.invoke('toggle-minimize'),
    toggleLock: () => ipcRenderer.invoke('toggle-lock'),
    setOpacity: (opacity) => ipcRenderer.invoke('set-opacity', opacity),
    closeApp: () => ipcRenderer.invoke('close-app'),
});
