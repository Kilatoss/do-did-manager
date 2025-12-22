const { app, BrowserWindow } = require('electron');
const path = require('path');
require('./server.js'); 


if (process.env.NODE_ENV !== 'production') {
    try {
        require('electron-reloader')(module);
    } catch (_) {}
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        },
        width: 1000,
        height: 700,
        frame: false,
        titleBarStyle: "hidden",
        titleBarOverlay: {
            symbolColor: "#FFF",
            color: "#2b252c",
            height: 10,
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'public/index.html'));
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});