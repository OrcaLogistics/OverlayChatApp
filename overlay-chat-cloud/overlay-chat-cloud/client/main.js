/**
 * Overlay Chat - Electron Main Process
 * Cloud Edition with Room Codes
 */

const { app, BrowserWindow, ipcMain, screen, globalShortcut } = require('electron');
const path = require('path');
const config = require('./config');

let mainWindow = null;
let isMinimized = false;
let isLocked = false;

const WINDOW_CONFIG = {
    width: 380,
    height: 550,
    minWidth: 320,
    minHeight: 450,
    maxWidth: 500,
    maxHeight: 800
};

function createWindow() {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    
    mainWindow = new BrowserWindow({
        width: WINDOW_CONFIG.width,
        height: WINDOW_CONFIG.height,
        minWidth: WINDOW_CONFIG.minWidth,
        minHeight: WINDOW_CONFIG.minHeight,
        maxWidth: WINDOW_CONFIG.maxWidth,
        maxHeight: WINDOW_CONFIG.maxHeight,
        x: screenWidth - WINDOW_CONFIG.width - 20,
        y: Math.floor((screenHeight - WINDOW_CONFIG.height) / 2),
        
        // Overlay settings
        alwaysOnTop: true,
        frame: false,
        transparent: true,
        resizable: true,
        skipTaskbar: false,
        
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        
        backgroundColor: '#00000000',
        hasShadow: false
    });
    
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
    
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    
    mainWindow.on('blur', () => {
        if (!isMinimized) {
            mainWindow.setAlwaysOnTop(true, 'screen-saver');
        }
    });
    
    console.log(`${config.APP_NAME} v${config.VERSION} started!`);
}

// IPC Handlers
ipcMain.handle('get-config', () => {
    return {
        serverUrl: config.SERVER_URL,
        appName: config.APP_NAME,
        version: config.VERSION
    };
});

ipcMain.handle('toggle-minimize', () => {
    if (mainWindow) {
        if (isMinimized) {
            mainWindow.setSize(WINDOW_CONFIG.width, WINDOW_CONFIG.height);
            isMinimized = false;
        } else {
            mainWindow.setSize(WINDOW_CONFIG.width, 50);
            isMinimized = true;
        }
        return isMinimized;
    }
});

ipcMain.handle('toggle-lock', () => {
    if (mainWindow) {
        isLocked = !isLocked;
        mainWindow.setMovable(!isLocked);
        mainWindow.setResizable(!isLocked);
        return isLocked;
    }
});

ipcMain.handle('set-opacity', (event, opacity) => {
    if (mainWindow) {
        mainWindow.setOpacity(opacity);
    }
});

ipcMain.handle('close-app', () => {
    app.quit();
});

// App lifecycle
app.whenReady().then(() => {
    createWindow();
    
    globalShortcut.register('CommandOrControl+Shift+O', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
                mainWindow.setAlwaysOnTop(true, 'screen-saver');
            }
        }
    });
    
    console.log('Hotkey: Ctrl+Shift+O to toggle visibility');
});

app.on('window-all-closed', () => {
    globalShortcut.unregisterAll();
    app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}
