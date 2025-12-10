// main.js

// Módulos para controlar o ciclo de vida da aplicação e criar janelas do navegador
const { app, BrowserWindow } = require('electron');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
    // Tenta carregar o módulo electron-reloader
    try {
        require('electron-reloader')(module);
    } catch (_) {}
}

function createWindow() {
    // Cria a janela principal do navegador.
    const mainWindow = new BrowserWindow({
    webPreferences: {
      contextIsolation: false,
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

    // Carrega o index.html da sua SPA
    // IMPORTANTE: O caminho é em relação ao main.js
    mainWindow.loadFile(path.join(__dirname, 'public/index.html'));

    // Opcional: Abrir as ferramentas de desenvolvimento (DevTools)
    mainWindow.webContents.openDevTools();
}

// Este método será chamado quando o Electron terminar a inicialização
// e estiver pronto para criar janelas do navegador.
app.whenReady().then(() => {
    createWindow();

    // No macOS, é comum recriar uma janela na doca quando não há janelas abertas.
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Encerra a aplicação quando todas as janelas forem fechadas (exceto no macOS)
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});