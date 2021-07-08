import path from 'path';
import url from 'url';
import { app, BrowserWindow, ipcMain } from 'electron';
import isDev from 'electron-is-dev';

import { PROTOCOL } from '@desktop-electron/libs/constants';
import * as store from '@desktop-electron/libs/store';
import { MIN_HEIGHT, MIN_WIDTH } from '@desktop-electron/libs/screen';
import Logger, { LogLevel, defaultOptions as loggerDefaults } from '@desktop-electron/libs/logger';
import { buildInfo, computerInfo } from '@desktop-electron/libs/info';
import modules from '@desktop-electron/libs/modules';

let mainWindow: BrowserWindow;
let spendWindow: BrowserWindow | undefined;

const APP_NAME = 'Trezor Suite';
const src = isDev
    ? 'http://localhost:8000/'
    : url.format({
          pathname: 'index.html',
          protocol: PROTOCOL,
          slashes: true,
      });

// Logger
const log = {
    level: app.commandLine.getSwitchValue('log-level') || (isDev ? 'debug' : 'error'),
    writeToConsole: !app.commandLine.hasSwitch('log-no-print'),
    writeToDisk: app.commandLine.hasSwitch('log-write'),
    outputFile: app.commandLine.getSwitchValue('log-file') || loggerDefaults.outputFile,
    outputPath: app.commandLine.getSwitchValue('log-path') || loggerDefaults.outputPath,
};

const logger = new Logger(log.level as LogLevel, { ...log });

// Globals
global.logger = logger;
global.resourcesPath = isDev
    ? path.join(__dirname, '..', 'public', 'static')
    : process.resourcesPath;

logger.info('main', 'Application starting');

const init = async () => {
    buildInfo();
    await computerInfo();

    const winBounds = store.getWinBounds();
    logger.debug('init', `Create Browswer Window (${winBounds.width}x${winBounds.height})`);

    mainWindow = new BrowserWindow({
        title: APP_NAME,
        width: winBounds.width,
        height: winBounds.height,
        frame: false,
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        webPreferences: {
            webSecurity: !isDev,
            nativeWindowOpen: true,
            allowRunningInsecureContent: isDev,
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
        },
        icon: path.join(global.resourcesPath, 'images', 'icons', '512x512.png'),
    });

    // Load page
    logger.debug('init', `Load URL (${src})`);
    mainWindow.loadURL(src);

    // Modules
    await modules({
        mainWindow,
        spendWindow,
        src,
        store,
    });
};

// https://www.electronjs.org/docs/all#apprequestsingleinstancelock
const singleInstance = app.requestSingleInstanceLock();
if (!singleInstance) {
    logger.warn('main', 'Second instance detected, quitting...');
    app.quit();
} else {
    logger.info('main', 'Application starting');

    app.on('second-instance', () => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    app.name = APP_NAME; // overrides @trezor/suite-desktop app name in menu
    app.on('ready', init);
}

app.on('before-quit', () => {
    if (!mainWindow) return;
    mainWindow.removeAllListeners();
    spendWindow?.removeAllListeners();
    logger.exit();
});

ipcMain.on('app/restart', () => {
    logger.info('main', 'App restart requested');
    app.relaunch();
    app.exit();
});

ipcMain.on('invity/spend-window-open', (_, url: string) => {
    if (!spendWindow) {
        const mainWindowBounds = mainWindow.getBounds();

        // show spend window based on main window (Suite) position
        spendWindow = new BrowserWindow({
            x: mainWindowBounds.width / 4 + mainWindowBounds.x,
            y: mainWindowBounds.height / 4 + mainWindowBounds.y,
            width: mainWindowBounds.width / 2,
            height: mainWindowBounds.height / 2,
        });

        spendWindow.on('closed', () => (spendWindow = undefined));
        spendWindow.setMenuBarVisibility(false);
        spendWindow.loadURL(url);
    } else {
        spendWindow.restore();
    }
});

ipcMain.on('invity/spend-window-focus', () => {
    if (spendWindow) {
        spendWindow.restore();
        spendWindow.focus();
    }
});
