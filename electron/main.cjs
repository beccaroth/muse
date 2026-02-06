const { app, BrowserWindow, nativeImage } = require('electron')
const path = require('path')

function getIconPath() {
  const isDev = !!process.env.VITE_DEV_SERVER_URL
  return isDev
    ? path.join(__dirname, '../public/icon-512.png')
    : path.join(__dirname, '../dist/icon-512.png')
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: nativeImage.createFromPath(getIconPath()),
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    app.dock.setIcon(nativeImage.createFromPath(getIconPath()))
  }
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
