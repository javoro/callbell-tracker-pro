import { app, BrowserWindow, ipcMain, dialog, Menu, session } from 'electron'
import path from 'path'
import { ensureDataDirs, readSeguimientos, writeSeguimientos, readCatalogos, writeCatalogos, readConfiguracion, writeConfiguracion, exportToExcel, exportAnalyticsToExcel, importFromExcel, seedCatalogosIfEmpty, readLicenciaClave, writeLicenciaClave, deleteLicenciaClave } from './persistencia'
import { exportAnalyticsToPowerPoint } from './exportAnalyticsPowerPoint'
import { setupAutoUpdater, checkForUpdatesManual } from './autoUpdater'
import type { Seguimiento, Configuracion } from './types'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Callbell Tracker PRO',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function showAcercaDe() {
  dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title: 'Acerca de Callbell Tracker PRO',
    message: 'Callbell Tracker PRO',
    detail: `Versión ${app.getVersion()}\n\nAplicación desarrollada a medida del cliente, según lo solicitado y con funciones adicionales según necesidades del negocio.\n\nDesarrollador: Javier Orona\nCorreo: jav.oro.qui@gmail.com`,
  })
}

app.whenReady().then(async () => {
  // CSP en producción (app empaquetada / file://). En dev, Vite inyecta scripts inline
  // para React Fast Refresh; forzar script-src 'self' rompe HMR y el preamble de @vitejs/plugin-react.
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    try {
      const { hostname } = new URL(details.url)
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        callback({ responseHeaders: details.responseHeaders })
        return
      }
    } catch {
      /* file:// u otras URLs */
    }
    const csp =
      "default-src 'self'; script-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co"
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
      },
    })
  })

  await ensureDataDirs()
  await seedCatalogosIfEmpty()
  registerIpcHandlers()
  createWindow()
  setupAutoUpdater(() => mainWindow)
  const menuTemplate = [
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Buscar actualizaciones…',
          click: () => checkForUpdatesManual(() => mainWindow),
        },
        { type: 'separator' },
        { label: 'Acerca de Callbell Tracker PRO', click: showAcercaDe },
      ],
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate as any))
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})

function registerIpcHandlers() {
  // ─── Licencia ──────────────────────────────────────────────
  ipcMain.handle('licencia:leer', async () => {
    try {
      const clave = await readLicenciaClave()
      return { ok: true, clave }
    } catch (err) {
      return { ok: false, clave: null, error: String(err) }
    }
  })

  ipcMain.handle('licencia:guardar', async (_e, clave: string) => {
    try {
      await writeLicenciaClave(clave)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  })

  ipcMain.handle('licencia:eliminar', async () => {
    try {
      await deleteLicenciaClave()
      return { ok: true }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  })

  ipcMain.handle('seguimientos:get', async () => {
    try {
      const data = await readSeguimientos()
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  })

  ipcMain.handle('seguimiento:save', async (_e, seguimiento: Seguimiento) => {
    try {
      const data = await readSeguimientos()
      data.push(seguimiento)
      await writeSeguimientos(data)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  })

  ipcMain.handle('seguimiento:update', async (_e, seguimiento: Seguimiento) => {
    try {
      const data = await readSeguimientos()
      const idx = data.findIndex((s) => s.id === seguimiento.id)
      if (idx === -1) return { ok: false, error: 'No encontrado' }
      data[idx] = seguimiento
      await writeSeguimientos(data)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  })

  ipcMain.handle('seguimiento:delete', async (_e, id: string) => {
    try {
      const data = await readSeguimientos()
      const filtered = data.filter((s) => s.id !== id)
      if (filtered.length === data.length) return { ok: false, error: 'No encontrado' }
      await writeSeguimientos(filtered)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  })

  ipcMain.handle('seguimiento:deleteMultiple', async (_e, ids: string[]) => {
    try {
      if (!ids?.length) return { ok: true, deleted: 0 }
      const data = await readSeguimientos()
      const idSet = new Set(ids)
      const filtered = data.filter((s) => !idSet.has(s.id))
      const deleted = data.length - filtered.length
      await writeSeguimientos(filtered)
      return { ok: true, deleted }
    } catch (err) {
      return { ok: false, error: String(err), deleted: 0 }
    }
  })

  ipcMain.handle('catalogos:get', async () => {
    try {
      const data = await readCatalogos()
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  })

  ipcMain.handle('catalogo:save', async (_e, item: { id: string; tipoCatalogo: string; nombre: string; activo: boolean; orden: number; createdAt: string; updatedAt: string }) => {
    try {
      const data = await readCatalogos()
      data.push(item)
      await writeCatalogos(data)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  })

  ipcMain.handle('catalogo:update', async (_e, item: { id: string; tipoCatalogo?: string; nombre?: string; activo?: boolean; orden?: number; updatedAt: string }) => {
    try {
      const data = await readCatalogos()
      const idx = data.findIndex((c) => c.id === item.id)
      if (idx === -1) return { ok: false, error: 'No encontrado' }
      data[idx] = { ...data[idx], ...item }
      await writeCatalogos(data)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  })

  ipcMain.handle('catalogo:delete', async (_e, id: string) => {
    try {
      const data = await readCatalogos()
      const filtered = data.filter((c) => c.id !== id)
      if (filtered.length === data.length) return { ok: false, error: 'No encontrado' }
      await writeCatalogos(filtered)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  })

  ipcMain.handle('config:get', async () => {
    try {
      const data = await readConfiguracion()
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  })

  ipcMain.handle('config:save', async (_e, config: Configuracion) => {
    try {
      await writeConfiguracion(config)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  })

  ipcMain.handle('export:excel', async (_e, payload: { seguimientos: Seguimiento[]; filePath: string }) => {
    try {
      await exportToExcel(payload.seguimientos, payload.filePath)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  })

  ipcMain.handle('export:analyticsExcel', async (_e, payload: { data: import('./persistencia').AnalyticsExportPayload; filePath: string }) => {
    try {
      await exportAnalyticsToExcel(payload.data, payload.filePath)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  })

  ipcMain.handle('export:analyticsPowerPoint', async (_e, payload: { data: import('./persistencia').AnalyticsExportPayload; filePath: string }) => {
    try {
      await exportAnalyticsToPowerPoint(payload.data, payload.filePath)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  })

  ipcMain.handle('dialog:showSaveDialog', async (_e, options: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) => {
    const result = await dialog.showSaveDialog(mainWindow!, options)
    return result
  })

  ipcMain.handle('dialog:showOpenDialog', async (_e, options: { filters?: { name: string; extensions: string[] }[] }) => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openFile'],
      filters: options?.filters ?? [{ name: 'Excel', extensions: ['xlsx'] }],
    })
    return result
  })

  ipcMain.handle('import:excel', async (_e, payload: { filePath: string; periodoSeleccionado: string }) => {
    try {
      const result = await importFromExcel(payload.filePath, payload.periodoSeleccionado)
      return result
    } catch (err) {
      return {
        ok: false,
        imported: 0,
        skipped: 0,
        catalogosAdded: 0,
        errors: [String(err)],
      }
    }
  })
}
