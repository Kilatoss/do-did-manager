// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

// --- ADIÇÃO: Inicia o servidor Backend ---
// Isto vai executar o código do server.js (ligar ao Mongo e abrir a porta 3000)
// assim que a aplicação abrir. Sem fork, sem bibliotecas extra.
require('./server.js'); 
// -----------------------------------------

if (process.env.NODE_ENV !== 'production') {
    try {
        require('electron-reloader')(module);
    } catch (_) {}
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true // Recomendado true para este setup simples
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

    // Certifica-te que este caminho está correto baseada na tua estrutura de pastas
    // Se o index.html está em /public, isto está correto:
    mainWindow.loadFile(path.join(__dirname, 'public/index.html'));

    // Opcional: Abrir DevTools
    // mainWindow.webContents.openDevTools();
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