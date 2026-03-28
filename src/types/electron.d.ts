import type { Seguimiento } from './seguimiento'
import type { Configuracion } from './configuracion'
import type { CatalogoItem } from './catalogo'
import type { FullAnalyticsExportPayload } from '@/features/analytics/analytics-otras-types'

export interface ElectronAPI {
  seguimientosGet: () => Promise<{ ok: boolean; data?: Seguimiento[]; error?: string }>
  seguimientoSave: (seguimiento: Seguimiento) => Promise<{ ok: boolean; error?: string }>
  seguimientoUpdate: (seguimiento: Seguimiento) => Promise<{ ok: boolean; error?: string }>
  seguimientoDelete: (id: string) => Promise<{ ok: boolean; error?: string }>
  seguimientoDeleteMultiple: (ids: string[]) => Promise<{ ok: boolean; deleted?: number; error?: string }>
  catalogosGet: () => Promise<{ ok: boolean; data?: CatalogoItem[]; error?: string }>
  catalogoSave: (item: CatalogoItem) => Promise<{ ok: boolean; error?: string }>
  catalogoUpdate: (item: Partial<CatalogoItem> & { id: string; updatedAt: string }) => Promise<{ ok: boolean; error?: string }>
  catalogoDelete: (id: string) => Promise<{ ok: boolean; error?: string }>
  configGet: () => Promise<{ ok: boolean; data?: Configuracion; error?: string }>
  configSave: (config: Configuracion) => Promise<{ ok: boolean; error?: string }>
  exportExcel: (payload: { seguimientos: Seguimiento[]; filePath: string }) => Promise<{ ok: boolean; error?: string }>
  exportAnalyticsExcel: (payload: { data: FullAnalyticsExportPayload; filePath: string }) => Promise<{ ok: boolean; error?: string }>
  exportAnalyticsPowerPoint: (payload: { data: FullAnalyticsExportPayload; filePath: string }) => Promise<{ ok: boolean; error?: string }>
  dialogShowSaveDialog: (options: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) => Promise<{ canceled: boolean; filePath?: string }>
  dialogShowOpenDialog: (options?: { filters?: { name: string; extensions: string[] }[] }) => Promise<{ canceled: boolean; filePaths?: string[] }>
  importExcel: (payload: { filePath: string; periodoSeleccionado: string }) => Promise<{
    ok: boolean
    imported: number
    skipped: number
    catalogosAdded: number
    errors: string[]
  }>
  licenciaMachineId: () => Promise<{ ok: boolean; id: string | null; error?: string }>
  licenciaLeer: () => Promise<{ ok: boolean; clave: string | null; error?: string }>
  licenciaGuardar: (clave: string) => Promise<{ ok: boolean; error?: string }>
  licenciaEliminar: () => Promise<{ ok: boolean; error?: string }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
