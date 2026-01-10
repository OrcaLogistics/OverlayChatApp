/**
 * Overlay Chat - Minimal Edition
 * Compact, unobtrusive design
 */

const { app, BrowserWindow, ipcMain, screen, globalShortcut } = require('electron');
const path = require('path');
const config = require('./config');

let mainWindow = null;
let isMinimized = false;
let isLocked = false;
let isHidden = false;

const WINDOW_CONFIG = {
    width: 280,
    height: 360,
    minWidth: 240,
    minHeight: 300,
    maxWidth: 350,
    maxHeight: 500
};

function createWindow() {
    if (mainWindow !== null) {
        mainWindow.focus();
        return;
    }
    
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    
    mainWindow = new BrowserWindow({
        width: WINDOW_CONFIG.width,
        height: WINDOW_CONFIG.height,
        minWidth: WINDOW_CONFIG.minWidth,
        minHeight: WINDOW_CONFIG.minHeight,
        maxWidth: WINDOW_CONFIG.maxWidth,
        maxHeight: WINDOW_CONFIG.maxHeight,
        x: screenWidth - WINDOW_CONFIG.width - 10,
        y: screenHeight - WINDOW_CONFIG.height - 40,
        
        alwaysOnTop: true,
        frame: false,
        transparent: false,
        resizable: true,
        skipTaskbar: false,
        show: false,
        
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        
        backgroundColor: '#1a1a1a'
    });
    
    mainWindow.setAlwaysOnTop(true, 'floating');
    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
    
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
    
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    
    mainWindow.on('blur', () => {
        if (mainWindow && !isHidden) {
            mainWindow.setAlwaysOnTop(true, 'floating');
        }
    });
    
    console.log(`${config.APP_NAME} v${config.VERSION}`);
}

function toggleVisibility() {
    if (!mainWindow) return;
    
    if (isHidden) {
        mainWindow.show();
        mainWindow.setAlwaysOnTop(true, 'floating');
        mainWindow.focus();
        isHidden = false;
    } else {
        mainWindow.hide();
        isHidden = true;
    }
}

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
            mainWindow.setSize(WINDOW_CONFIG.width, 32);
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

ipcMain.handle('set-opacity', (event, opacity) => {});

ipcMain.handle('close-app', () => {
    app.quit();
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (isHidden) {
                mainWindow.show();
                isHidden = false;
            }
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();
        }
    });
    
    app.whenReady().then(() => {
        createWindow();
        
        const shortcutRegistered = globalShortcut.register('CommandOrControl+Shift+O', toggleVisibility);
        
        if (shortcutRegistered) {
            console.log('Hotkey: Ctrl+Shift+O');
        }
    });
}

app.on('window-all-closed', () => {
    globalShortcut.unregisterAll();
    app.quit();
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
