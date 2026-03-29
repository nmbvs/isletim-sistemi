const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        // Tam ekran kiosk modu - tüm ekranı kaplar
        fullscreen: true,
        kiosk: false,          // kiosk=true olsa ESC çalışmaz, false bırakıyoruz
        frame: false,          // Pencere çerçevesi yok
        titleBarStyle: 'hidden',
        backgroundColor: '#0f0c29',

        // Güvenlik ve web ayarları
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webviewTag: true
        },

        // İkon (opsiyonel)
        icon: path.join(__dirname, 'favicon.ico'),

        // Başlık
        title: 'Kişisel İşletim Sistemi v2.0',
    });

    // index.html dosyasını yükle
    mainWindow.loadFile('index.html');

    // Geliştirici araçlarını kapat (production)
    mainWindow.webContents.closeDevTools();

    // Pencere hazır olunca göster
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    });
}

app.whenReady().then(() => {
    createWindow();

    // Alt+F4 ile çık
    globalShortcut.register('Alt+F4', () => {
        app.quit();
    });
});

// Tüm pencereler kapanınca uygulamayı kapat
app.on('window-all-closed', () => {
    globalShortcut.unregisterAll();
    app.quit();
});

// Olası hatalar için kısayolları temizle
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
