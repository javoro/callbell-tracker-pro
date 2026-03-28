import { contextBridge, ipcRenderer } from 'electron'

const api = {
  seguimientosGet: () => ipcRenderer.invoke('seguimientos:get'),
  seguimientoSave: (seguimiento: unknown) => ipcRenderer.invoke('seguimiento:save', seguimiento),
  seguimientoUpdate: (seguimiento: unknown) => ipcRenderer.invoke('seguimiento:update', seguimiento),
  seguimientoDelete: (id: string) => ipcRenderer.invoke('seguimiento:delete', id),
  seguimientoDeleteMultiple: (ids: string[]) => ipcRenderer.invoke('seguimiento:deleteMultiple', ids),
  catalogosGet: () => ipcRenderer.invoke('catalogos:get'),
  catalogoSave: (item: unknown) => ipcRenderer.invoke('catalogo:save', item),
  catalogoUpdate: (item: unknown) => ipcRenderer.invoke('catalogo:update', item),
  catalogoDelete: (id: string) => ipcRenderer.invoke('catalogo:delete', id),
  configGet: () => ipcRenderer.invoke('config:get'),
  configSave: (config: unknown) => ipcRenderer.invoke('config:save', config),
  exportExcel: (payload: { seguimientos: unknown[]; filePath: string }) => ipcRenderer.invoke('export:excel', payload),
  exportAnalyticsExcel: (payload: { data: unknown; filePath: string }) =>
    ipcRenderer.invoke('export:analyticsExcel', payload),
  exportAnalyticsPowerPoint: (payload: { data: unknown; filePath: string }) =>
    ipcRenderer.invoke('export:analyticsPowerPoint', payload),
  dialogShowSaveDialog: (options: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) =>
    ipcRenderer.invoke('dialog:showSaveDialog', options),
  dialogShowOpenDialog: (options?: { filters?: { name: string; extensions: string[] }[] }) =>
    ipcRenderer.invoke('dialog:showOpenDialog', options ?? {}),
  importExcel: (payload: { filePath: string; periodoSeleccionado: string }) =>
    ipcRenderer.invoke('import:excel', payload),
  licenciaLeer: () => ipcRenderer.invoke('licencia:leer'),
  licenciaGuardar: (clave: string) => ipcRenderer.invoke('licencia:guardar', clave),
  licenciaEliminar: () => ipcRenderer.invoke('licencia:eliminar'),
}

contextBridge.exposeInMainWorld('electronAPI', api)
