'use strict'

const { app, BrowserWindow } = require('electron') 
const operateExcel = require('./excel')
const setTray = require('./tray')
const setMenu = require('./menu')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
const isDev = process.env.NODE_ENV === 'development'

if (!isDev) {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = isDev
  ? 'http://localhost:9080'
  : `file://${__dirname}/index.html`

// 使外部debug attach 到主线程上
// https://simulatedgreg.gitbooks.io/electron-vue/content/en/debugging-production.html
if (isDev) {
  app.commandLine.appendSwitch('inspect', '5858')
}

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: '1200',
    height: 800,
    useContentSize: true,
  })

  mainWindow.loadURL(winURL)
  setMenu()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', () => {
  createWindow()
  setTray()
  operateExcel()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
