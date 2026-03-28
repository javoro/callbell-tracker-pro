import { app, BrowserWindow, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'

let manualCheckPending = false

function messageBox(win: BrowserWindow | null, options: Electron.MessageBoxOptions) {
  if (win && !win.isDestroyed()) {
    return dialog.showMessageBox(win, options)
  }
  return dialog.showMessageBox(options)
}

/**
 * Actualizaciones desde GitHub Releases (público). Solo en app empaquetada (instalador).
 * Requiere `repository` + `publish` en package.json y un release con los artefactos de electron-builder.
 */
export function setupAutoUpdater(getWindow: () => BrowserWindow | null) {
  if (!app.isPackaged) return

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false

  autoUpdater.on('update-available', (info) => {
    manualCheckPending = false
    const win = getWindow()
    void messageBox(win, {
      type: 'info',
      title: 'Actualización disponible',
      message: `Hay una versión nueva: ${info.version}`,
      detail: '¿Deseas descargarla ahora? Puedes seguir usando la aplicación mientras se descarga.',
      buttons: ['Descargar', 'Más tarde'],
      defaultId: 0,
      cancelId: 1,
    }).then(({ response }) => {
      if (response === 0) void autoUpdater.downloadUpdate()
    })
  })

  autoUpdater.on('update-not-available', () => {
    if (!manualCheckPending) return
    manualCheckPending = false
    const win = getWindow()
    void messageBox(win, {
      type: 'info',
      title: 'Actualizaciones',
      message: 'Estás usando la última versión disponible.',
      buttons: ['Aceptar'],
    })
  })

  autoUpdater.on('error', (err) => {
    if (!manualCheckPending) return
    manualCheckPending = false
    const win = getWindow()
    void messageBox(win, {
      type: 'error',
      title: 'Error al buscar actualizaciones',
      message: err.message,
      buttons: ['Aceptar'],
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    const win = getWindow()
    void messageBox(win, {
      type: 'info',
      title: 'Lista para instalar',
      message: `La versión ${info.version} ya se descargó.`,
      detail: 'Se cerrará la aplicación para ejecutar el instalador. Guarda tu trabajo antes de continuar.',
      buttons: ['Instalar y reiniciar', 'Más tarde'],
      defaultId: 0,
      cancelId: 1,
    }).then(({ response }) => {
      if (response === 0) setImmediate(() => autoUpdater.quitAndInstall(false, true))
    })
  })

  setTimeout(() => {
    void autoUpdater.checkForUpdates()
  }, 4000)
}

export function checkForUpdatesManual(getWindow: () => BrowserWindow | null) {
  if (!app.isPackaged) {
    void messageBox(getWindow(), {
      type: 'info',
      title: 'Modo desarrollo',
      message: 'Las actualizaciones automáticas solo funcionan en la aplicación instalada (compilada).',
      buttons: ['Aceptar'],
    })
    return
  }
  manualCheckPending = true
  void autoUpdater.checkForUpdates()
}
