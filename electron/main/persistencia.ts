import { app } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import ExcelJS from 'exceljs'
import type { Seguimiento } from './types'
import type { Configuracion } from './types'
import type { CatalogoItem } from './types'

function uuid(): string {
  return crypto.randomUUID()
}

/** Dada una fecha YYYY-MM-DD, devuelve la etiqueta de semana ISO (S01..S53). */
function getSemanaEtiquetaFromDate(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number)
  if (!y || !m || !d) return 'S01'
  const date = new Date(y, m - 1, d)
  const day = date.getDay() || 7
  const thu = new Date(date)
  thu.setDate(date.getDate() + 4 - day)
  const yearStart = new Date(thu.getFullYear(), 0, 1)
  const weekNo = Math.ceil((((thu.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return 'S' + String(weekNo).padStart(2, '0')
}

const DEFAULT_CONFIG: Configuracion = {
  tipoCorte: 'semanal',
  fechaInicioPersonalizada: null,
  fechaFinPersonalizada: null,
  diaInicioSemana: 1,
  rutaExportacionPorDefecto: null,
  ultimaFechaUso: null,
  metaSemanal: null,
}

function getDataDir(): string {
  return path.join(app.getPath('userData'), 'data')
}

function getExportsDir(): string {
  return path.join(app.getPath('userData'), 'exports')
}

export async function ensureDataDirs(): Promise<void> {
  const dataDir = getDataDir()
  const exportsDir = getExportsDir()
  await fs.mkdir(dataDir, { recursive: true })
  await fs.mkdir(exportsDir, { recursive: true })
}

function seguidoresPath(): string {
  return path.join(getDataDir(), 'seguimientos.json')
}

function catalogosPath(): string {
  return path.join(getDataDir(), 'catalogos.json')
}

function configPath(): string {
  return path.join(getDataDir(), 'configuracion.json')
}

function licenciaPath(): string {
  return path.join(getDataDir(), 'licencia.json')
}

export async function readLicenciaClave(): Promise<string | null> {
  try {
    const raw = await fs.readFile(licenciaPath(), 'utf-8')
    const data = JSON.parse(raw) as { clave?: string }
    return data?.clave ?? null
  } catch {
    return null
  }
}

export async function writeLicenciaClave(clave: string): Promise<void> {
  await writeJsonSafe(licenciaPath(), { clave })
}

export async function deleteLicenciaClave(): Promise<void> {
  try {
    await fs.unlink(licenciaPath())
  } catch {
    // no existe, ignorar
  }
}

async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(raw) as T
    return data != null ? data : defaultValue
  } catch {
    return defaultValue
  }
}

async function writeJsonSafe<T>(filePath: string, data: T): Promise<void> {
  const tmpPath = filePath + '.tmp.' + Date.now()
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8')
  await fs.rename(tmpPath, filePath)
}

function isArray(x: unknown): x is unknown[] {
  return Array.isArray(x)
}

function isConfig(x: unknown): x is Configuracion {
  return typeof x === 'object' && x != null && 'tipoCorte' in x
}

export async function readSeguimientos(): Promise<Seguimiento[]> {
  const data = await readJsonFile<unknown>(seguidoresPath(), [])
  if (!isArray(data)) return []
  return data
    .filter((item): item is any => typeof item === 'object' && item != null && 'id' in item && 'contacto' in item)
    .map((raw) => {
      const cotizacionPedido =
        typeof raw.cotizacionPedido === 'string'
          ? raw.cotizacionPedido
          : typeof raw.cotizacionPedidoNombre === 'string'
            ? raw.cotizacionPedidoNombre
            : typeof raw.cotizacionPedidoId === 'string'
              ? raw.cotizacionPedidoId
              : ''

      return {
        ...raw,
        cotizacionPedido,
      } as Seguimiento
    })
}

export async function writeSeguimientos(data: Seguimiento[]): Promise<void> {
  await writeJsonSafe(seguidoresPath(), data)
}

export async function readCatalogos(): Promise<CatalogoItem[]> {
  const data = await readJsonFile<unknown>(catalogosPath(), [])
  if (!isArray(data)) return []
  return data.filter((item): item is CatalogoItem => typeof item === 'object' && item != null && 'id' in item && 'tipoCatalogo' in item) as CatalogoItem[]
}

export async function writeCatalogos(data: CatalogoItem[]): Promise<void> {
  await writeJsonSafe(catalogosPath(), data)
}

export async function readConfiguracion(): Promise<Configuracion> {
  const data = await readJsonFile<unknown>(configPath(), DEFAULT_CONFIG)
  if (!isConfig(data)) return DEFAULT_CONFIG
  return { ...DEFAULT_CONFIG, ...data }
}

export async function writeConfiguracion(config: Configuracion): Promise<void> {
  await writeJsonSafe(configPath(), config)
}

/** Datos semilla opcionales: catálogos mínimos cuando el archivo está vacío. */
export async function seedCatalogosIfEmpty(): Promise<void> {
  const data = await readCatalogos()
  if (data.length > 0) return
  const now = new Date().toISOString()
  const seed: CatalogoItem[] = [
    { id: 'seed-tema-1', tipoCatalogo: 'tema', nombre: 'Ventas', activo: true, orden: 1, createdAt: now, updatedAt: now },
    { id: 'seed-tema-2', tipoCatalogo: 'tema', nombre: 'Soporte', activo: true, orden: 2, createdAt: now, updatedAt: now },
    { id: 'seed-motivo-1', tipoCatalogo: 'motivoContacto', nombre: 'Consulta', activo: true, orden: 1, createdAt: now, updatedAt: now },
    { id: 'seed-motivo-2', tipoCatalogo: 'motivoContacto', nombre: 'Seguimiento', activo: true, orden: 2, createdAt: now, updatedAt: now },
    { id: 'seed-compro-1', tipoCatalogo: 'compro', nombre: 'Sí', activo: true, orden: 1, createdAt: now, updatedAt: now },
    { id: 'seed-compro-2', tipoCatalogo: 'compro', nombre: 'No', activo: true, orden: 2, createdAt: now, updatedAt: now },
    { id: 'seed-vend-1', tipoCatalogo: 'vendedor', nombre: 'Vendedor 1', activo: true, orden: 1, createdAt: now, updatedAt: now },
    { id: 'seed-dept-1', tipoCatalogo: 'departamento', nombre: 'Ventas', activo: true, orden: 1, createdAt: now, updatedAt: now },
    { id: 'seed-dept-2', tipoCatalogo: 'departamento', nombre: 'Administración', activo: true, orden: 2, createdAt: now, updatedAt: now },
  ]
  await writeCatalogos(seed)
}

const EXCEL_HEADERS = [
  'Contacto',
  'Celular',
  'Tema',
  'Fecha',
  'Periodo',
  'Motivo de compra o no compra',
  'Compró',
  'Cotización o pedido',
  'Vendedor',
  'Monto',
  'Cotizado',
  'Folio factura',
  'Departamento',
]

/** Formatea fecha YYYY-MM-DD a dd/mm/yyyy para Excel. */
function formatFechaExcel(fecha: string): string {
  if (!fecha) return ''
  const [y, m, d] = fecha.split('-')
  return d && m && y ? `${d}/${m}/${y}` : fecha
}

export async function exportToExcel(seguimientos: Seguimiento[], filePath: string): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Seguimientos', { views: [{ state: 'frozen', ySplit: 1 }] })

  sheet.addRow(EXCEL_HEADERS)
  const headerRow = sheet.getRow(1)
  const headerFill = {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: 'FF2E7D32' },
  }
  for (let c = 1; c <= EXCEL_HEADERS.length; c++) {
    const cell = headerRow.getCell(c)
    cell.fill = headerFill
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.alignment = { horizontal: 'center' }
  }

  for (const s of seguimientos) {
    sheet.addRow([
      s.contacto,
      String(s.celular ?? ''),
      s.temaNombre,
      formatFechaExcel(s.fecha),
      s.periodoEtiqueta ?? getSemanaEtiquetaFromDate(s.fecha),
      s.motivoContactoNombre,
      s.comproNombre,
      s.cotizacionPedido,
      s.vendedorNombre,
      s.monto ?? '',
      s.cotizado ?? '',
      s.folioFactura,
      s.departamentoNombre,
    ])
  }

  const cols = [16, 14, 14, 12, 8, 18, 12, 18, 14, 12, 12, 14, 14]
  sheet.columns.forEach((col, i) => {
    if (col) col.width = cols[i] ?? 12
  })

  const colCelular = 2
  const monedaColMonto = 10
  const monedaColCotizado = 11
  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r)
    row.getCell(colCelular).numFmt = '@'
    if (row.getCell(monedaColMonto).value !== '' && row.getCell(monedaColMonto).value != null) {
      row.getCell(monedaColMonto).numFmt = '"$"#,##0.00'
    }
    if (row.getCell(monedaColCotizado).value !== '' && row.getCell(monedaColCotizado).value != null) {
      row.getCell(monedaColCotizado).numFmt = '"$"#,##0.00'
    }
  }

  await workbook.xlsx.writeFile(filePath)
}

export interface AnalyticsExportPayload {
  relevantes: {
    semanaActual: {
      etiqueta: string
      inicio: string
      fin: string
      leadsTotales: number
      cotizaciones: number
      cotizacionesEnSeguimiento: number
      concretadasEnVenta: number
      ventas: number
      ticketPromedio: number
    }
    semanaAnterior: {
      etiqueta: string
      inicio: string
      fin: string
      leadsTotales: number
      cotizaciones: number
      cotizacionesEnSeguimiento: number
      concretadasEnVenta: number
      ventas: number
      ticketPromedio: number
    } | null
    deltas: { leads: number; cotizaciones: number; concretadas: number }
    metaSemanal: number | null
    porcentajeMeta: number | null
  }
  kpi: {
    leadsTotales: number
    cotizaciones: number
    ventasCerradas: number
    tasaCierre: number
    montoVendido: number
    montoCotizado: number
    pipelineAbierto: number
    ticketPromedio: number
  }
  funnel: {
    leads: number
    cotizaciones: number
    ventas: number
    cotizacionesAbiertas: number
    conversionLeadCotizacion: number
    conversionCotizacionVenta: number
    conversionLeadVenta: number
  }
  trend: {
    label: string
    fecha: string
    leads: number
    cotizaciones: number
    ventas: number
    montoVendido: number
  }[]
  vendor: {
    vendedor: string
    leads: number
    cotizaciones: number
    ventas: number
    tasaCierre: number
    montoVendido: number
    montoCotizado: number
    ticketPromedio: number
  }[]
  pipeline: {
    contacto: string
    fecha: string
    celular: string
    vendedor: string
    cotizado: number
    diasAbierta: number
    semaforo: string
  }[]
  quality: {
    metrics: {
      pctSinCelular: number
      pctSinVendedor: number
      pctSinCotizado: number
      pctSinCompra: number
      pctRegistrosCompletos: number
      duplicadosPorCelular: number
    }
    alerts: {
      mensaje: string
      cantidad: number
    }[]
  }
  screenshots?: {
    title: string
    imageBase64: string
    width: number
    height: number
  }[]
  relevantesScreenshot?: {
    title: string
    imageBase64: string
    width: number
    height: number
  }
  kpiCardsScreenshot?: {
    title: string
    imageBase64: string
    width: number
    height: number
  }
  funnelScreenshot?: {
    title: string
    imageBase64: string
    width: number
    height: number
  }
  trendScreenshot?: {
    title: string
    imageBase64: string
    width: number
    height: number
  }
  trendPresentationMeta?: {
    agrupacion: 'diario' | 'semanal'
    vista: 'barras' | 'lineas'
  }
}

export async function exportAnalyticsToExcel(
  data: AnalyticsExportPayload,
  filePath: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Analíticas', { views: [{ state: 'frozen', ySplit: 1 }] })

  const headerFill = {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: 'FF2E7D32' },
  }

  sheet.addRow(['Indicador', 'Valor'])
  const headerRow = sheet.getRow(1)
  headerRow.getCell(1).fill = headerFill
  headerRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.getCell(2).fill = headerFill
  headerRow.getCell(2).font = { bold: true, color: { argb: 'FFFFFFFF' } }

  // Relevantes
  const { semanaActual, semanaAnterior, deltas, porcentajeMeta } = data.relevantes
  const formatDelta = (n: number) => (n === 0 ? '' : n > 0 ? ` (+${n})` : ` (${n})`)

  const rows: [string, string | number][] = [
    [`Leads totales ${semanaActual.etiqueta}`, `${semanaActual.leadsTotales}${semanaAnterior ? formatDelta(deltas.leads) : ''}`],
    ['Cotizaciones', `${semanaActual.cotizaciones}${semanaAnterior ? formatDelta(deltas.cotizaciones) : ''}`],
    ['Cotizaciones en seguimiento', semanaActual.cotizacionesEnSeguimiento],
    ['Cotizaciones concretadas en venta', `${semanaActual.concretadasEnVenta}${semanaAnterior ? formatDelta(deltas.concretadas) : ''}`],
  ]

  if (semanaAnterior) {
    rows.push([`Ventas Semana ${semanaAnterior.etiqueta.replace('S', '')}`, semanaAnterior.ventas])
    rows.push([`Ticket promedio ${semanaAnterior.etiqueta.replace('S', '')}`, semanaAnterior.ticketPromedio])
  }
  rows.push([`Ventas ${semanaActual.etiqueta}`, semanaActual.ventas])
  rows.push([`Ticket promedio ${semanaActual.etiqueta.replace('S', '')}`, semanaActual.ticketPromedio])
  if (porcentajeMeta != null) {
    rows.push(['% de la meta semanal', porcentajeMeta])
  }

  for (const [indicador, valor] of rows) {
    const row = sheet.addRow([indicador, typeof valor === 'number' ? valor : String(valor)])
    const cellB = row.getCell(2)
    const isMoneda = /Ventas|Ticket promedio/.test(indicador)
    const isPct = indicador === '% de la meta semanal'
    if (isMoneda && typeof valor === 'number') cellB.numFmt = '"$"#,##0.00'
    if (isPct && typeof valor === 'number') cellB.numFmt = '0.00"%"'
  }

  sheet.getColumn(1).width = 38
  sheet.getColumn(2).width = 22

  // Línea en blanco
  sheet.addRow([])

  // Sección Otras - KPIs
  sheet.addRow(['Otras - Resumen ejecutivo adicional', ''])
  const kpi = data.kpi
  const kpiRows: [string, string | number][] = [
    ['Leads totales', kpi.leadsTotales],
    ['Cotizaciones', kpi.cotizaciones],
    ['Ventas cerradas', kpi.ventasCerradas],
    ['Tasa de cierre', kpi.tasaCierre],
    ['Monto vendido', kpi.montoVendido],
    ['Monto cotizado', kpi.montoCotizado],
    ['Pipeline abierto', kpi.pipelineAbierto],
    ['Ticket promedio', kpi.ticketPromedio],
  ]
  for (const [indicador, valor] of kpiRows) {
    const row = sheet.addRow([indicador, valor])
    const cellB = row.getCell(2)
    const isMoneda = /Monto|Pipeline|Ticket/.test(indicador)
    const isPct = indicador === 'Tasa de cierre'
    if (isMoneda && typeof valor === 'number') cellB.numFmt = '"$"#,##0.00'
    if (isPct && typeof valor === 'number') cellB.numFmt = '0.00"%"'
  }

  // Sección Otras - Funnel
  sheet.addRow([])
  sheet.addRow(['Otras - Funnel comercial', ''])
  const f = data.funnel
  const funnelRows: [string, string | number][] = [
    ['Leads', f.leads],
    ['Cotizaciones', f.cotizaciones],
    ['Ventas', f.ventas],
    ['Cotizaciones abiertas', f.cotizacionesAbiertas],
    ['Lead → Cotización', f.conversionLeadCotizacion],
    ['Cotización → Venta', f.conversionCotizacionVenta],
    ['Lead → Venta', f.conversionLeadVenta],
  ]
  for (const [indicador, valor] of funnelRows) {
    const row = sheet.addRow([indicador, valor])
    const cellB = row.getCell(2)
    const isPct = /→/.test(indicador)
    if (isPct && typeof valor === 'number') cellB.numFmt = '0.00"%"'
  }

  // Sección Otras - Tendencia
  sheet.addRow([])
  sheet.addRow(['Otras - Tendencia (semanal)', ''])
  if (data.trend.length > 0) {
    sheet.addRow(['Periodo', 'Leads', 'Cotizaciones', 'Ventas', 'Monto vendido'])
    for (const p of data.trend) {
      const row = sheet.addRow([p.label, p.leads, p.cotizaciones, p.ventas, p.montoVendido])
      const cellMonto = row.getCell(5)
      cellMonto.numFmt = '"$"#,##0.00'
    }
  }

  // Sección Otras - Ranking por vendedor
  sheet.addRow([])
  sheet.addRow(['Otras - Ranking por vendedor', ''])
  if (data.vendor.length > 0) {
    sheet.addRow([
      'Vendedor',
      'Leads',
      'Cotizaciones',
      'Ventas',
      'Tasa cierre',
      'Monto vendido',
      'Monto cotizado',
      'Ticket promedio',
    ])
    for (const r of data.vendor) {
      const row = sheet.addRow([
        r.vendedor,
        r.leads,
        r.cotizaciones,
        r.ventas,
        r.tasaCierre,
        r.montoVendido,
        r.montoCotizado,
        r.ticketPromedio,
      ])
      row.getCell(5).numFmt = '0.00"%"'
      row.getCell(6).numFmt = '"$"#,##0.00'
      row.getCell(7).numFmt = '"$"#,##0.00'
      row.getCell(8).numFmt = '"$"#,##0.00'
    }
  }

  // Sección Otras - Pipeline abierto
  sheet.addRow([])
  sheet.addRow(['Otras - Pipeline abierto', ''])
  if (data.pipeline.length > 0) {
    sheet.addRow(['Contacto', 'Fecha', 'Celular', 'Vendedor', 'Cotizado', 'Días abierta', 'Semáforo'])
    for (const r of data.pipeline) {
      const row = sheet.addRow([
        r.contacto,
        r.fecha,
        r.celular,
        r.vendedor,
        r.cotizado,
        r.diasAbierta,
        r.semaforo,
      ])
      row.getCell(5).numFmt = '"$"#,##0.00'
    }
  }

  // Sección Otras - Calidad de captura
  sheet.addRow([])
  sheet.addRow(['Otras - Calidad de captura', ''])
  const qm = data.quality.metrics
  const qRows: [string, string | number][] = [
    ['% sin celular', qm.pctSinCelular],
    ['% sin vendedor', qm.pctSinVendedor],
    ['% sin cotizado', qm.pctSinCotizado],
    ['% sin compra', qm.pctSinCompra],
    ['% registros completos', qm.pctRegistrosCompletos],
    ['Duplicados por celular', qm.duplicadosPorCelular],
  ]
  for (const [indicador, valor] of qRows) {
    const row = sheet.addRow([indicador, valor])
    const cellB = row.getCell(2)
    const isPct = indicador.startsWith('%')
    if (isPct && typeof valor === 'number') cellB.numFmt = '0.00"%"'
  }
  if (data.quality.alerts.length > 0) {
    sheet.addRow([])
    sheet.addRow(['Alertas de calidad', ''])
    for (const a of data.quality.alerts) {
      sheet.addRow([a.mensaje, a.cantidad])
    }
  }

  const shots = data.screenshots
  if (shots && shots.length > 0) {
    const vis = workbook.addWorksheet('Vista en pantalla', {
      views: [{ showGridLines: false }],
    })
    vis.getColumn(1).width = 110

    let row = 1
    const maxImgWidth = 900

    for (const shot of shots) {
      const titleCell = vis.getCell(row, 1)
      titleCell.value = shot.title
      titleCell.font = { bold: true, size: 12, color: { argb: 'FF1B5E20' } }
      row += 1

      const srcW = shot.width > 0 ? shot.width : maxImgWidth
      const srcH = shot.height > 0 ? shot.height : 480
      const w = Math.min(maxImgWidth, srcW)
      const h = Math.round(srcH * (w / srcW))

      try {
        const imageId = workbook.addImage({
          base64: shot.imageBase64,
          extension: 'png',
        })
        // tl.row / col son índices base 0 (fila 1 de Excel = 0)
        vis.addImage(imageId, {
          tl: { col: 0, row: row - 1 },
          ext: { width: w, height: h },
        })
      } catch {
        vis.getCell(row, 1).value = '(No se pudo incrustar la captura; revise el tamaño o el formato.)'
      }

      const rowAdvance = Math.max(Math.ceil(h / 14) + 3, 8)
      row += rowAdvance
    }
  }

  await workbook.xlsx.writeFile(filePath)
}

/** Convierte valor de celda Excel a fecha YYYY-MM-DD */
function parseExcelDate(value: unknown): string | null {
  if (value == null || value === '') return null
  if (value instanceof Date) {
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, '0')
    const d = String(value.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  if (typeof value === 'number') {
    const date = new Date((value - 25569) * 86400 * 1000)
    return parseExcelDate(date)
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    const ddmmyyyy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`
    const yyyymmdd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (yyyymmdd) return trimmed
  }
  return null
}

function normalizeCatalogName(n: string): string {
  return n.trim()
}

function findInCatalog(catalogos: CatalogoItem[], tipo: string, nombre: string): CatalogoItem | undefined {
  const norm = normalizeCatalogName(nombre).toLowerCase()
  if (!norm) return undefined
  return catalogos.find((c) => c.tipoCatalogo === tipo && c.nombre.trim().toLowerCase() === norm)
}

function findOrCreateCatalogItem(
  catalogos: CatalogoItem[],
  tipo: string,
  nombre: string,
  now: string
): { id: string; nombre: string; added: boolean } {
  const n = normalizeCatalogName(nombre)
  if (!n) return { id: '', nombre: '', added: false }
  const found = findInCatalog(catalogos, tipo, n)
  if (found) return { id: found.id, nombre: found.nombre, added: false }
  const maxOrden = Math.max(0, ...catalogos.filter((c) => c.tipoCatalogo === tipo).map((c) => c.orden))
  const newItem: CatalogoItem = {
    id: uuid(),
    tipoCatalogo: tipo,
    nombre: n,
    activo: true,
    orden: maxOrden + 1,
    createdAt: now,
    updatedAt: now,
  }
  catalogos.push(newItem)
  return { id: newItem.id, nombre: newItem.nombre, added: true }
}

export interface ImportExcelResult {
  ok: boolean
  imported: number
  skipped: number
  catalogosAdded: number
  errors: string[]
}

export async function importFromExcel(
  filePath: string,
  periodoSeleccionado: string
): Promise<ImportExcelResult> {
  const errors: string[] = []
  let catalogosAdded = 0
  const now = new Date().toISOString()
  let catalogos = await readCatalogos()

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(filePath)
  const sheet = workbook.worksheets[0]
  if (!sheet || sheet.rowCount < 2) {
    return { ok: false, imported: 0, skipped: 0, catalogosAdded: 0, errors: ['El archivo no tiene datos o la hoja está vacía.'] }
  }

  /** Normaliza nombre de columna para comparación: trim y quita punto o dos puntos al final */
  function normalizeHeader(name: string): string {
    return (name || '').trim().replace(/[.:]+$/, '')
  }

  const headerRow = sheet.getRow(1)
  const fileHeaders: string[] = []
  for (let c = 1; c <= EXCEL_HEADERS.length; c++) {
    const v = headerRow.getCell(c).value
    fileHeaders.push(normalizeHeader(String(v != null ? v : '')))
  }
  const expectedHeaders = EXCEL_HEADERS.map((h) => normalizeHeader(h))
  const hasPeriodoCol = fileHeaders[4] === 'Periodo'
  const formatInvalid = fileHeaders.length < 12 ||
    fileHeaders[0] !== expectedHeaders[0] ||
    fileHeaders[1] !== expectedHeaders[1] ||
    fileHeaders[2] !== expectedHeaders[2] ||
    fileHeaders[3] !== expectedHeaders[3] ||
    (hasPeriodoCol ? fileHeaders[5] !== expectedHeaders[5] : fileHeaders[4] !== expectedHeaders[5])
  if (formatInvalid) {
    return {
      ok: false,
      imported: 0,
      skipped: 0,
      catalogosAdded: 0,
      errors: [`El archivo debe tener los encabezados en el mismo orden: ${EXCEL_HEADERS.join(', ')}.`],
    }
  }
  const offset = hasPeriodoCol ? 1 : 0

  /** Parsea monto desde celda (número o texto con $ y comas) */
  function parseMonto(value: unknown): number | null {
    if (value == null || value === '') return null
    if (typeof value === 'number') return Number.isNaN(value) ? null : value
    const s = String(value).trim().replace(/\$|,/g, '')
    const n = parseFloat(s)
    return Number.isNaN(n) ? null : n
  }

  const DEFAULT_SIN_ESPECIFICAR = 'Sin especificar'
  const DEFAULT_SIN_ASIGNAR = 'Sin asignar'

  const seguimientosToAdd: Seguimiento[] = []
  let skipped = 0

  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r)
    const getVal = (col: number) => {
      const v = row.getCell(col).value
      if (v == null) return ''
      if (typeof v === 'object' && 'text' in (v as any)) return String((v as any).text ?? '')
      return String(v).trim()
    }
    const contacto = getVal(1)
    const celular = getVal(2)
    const temaNombre = getVal(3) || DEFAULT_SIN_ESPECIFICAR
    const fechaVal = row.getCell(4).value
    const motivoNombre = getVal(5 + offset) || DEFAULT_SIN_ESPECIFICAR
    const comproNombre = getVal(6 + offset)
    const cotizNombre = getVal(7 + offset)
    const vendedorNombre = getVal(8 + offset) || DEFAULT_SIN_ESPECIFICAR
    const montoVal = row.getCell(9 + offset).value
    const cotizadoVal = row.getCell(10 + offset).value
    const folioFactura = getVal(11 + offset)
    const deptNombre = getVal(12 + offset) || DEFAULT_SIN_ASIGNAR

    const fecha = parseExcelDate(fechaVal)
    if (!fecha) {
      errors.push(`Fila ${r}: fecha inválida o vacía.`)
      skipped++
      continue
    }
    if (!contacto.trim() && !celular.trim()) {
      skipped++
      continue
    }

    const tema = findOrCreateCatalogItem(catalogos, 'tema', temaNombre, now)
    if (tema.added) catalogosAdded++
    const motivo = findOrCreateCatalogItem(catalogos, 'motivoContacto', motivoNombre, now)
    if (motivo.added) catalogosAdded++
    const compro = findOrCreateCatalogItem(catalogos, 'compro', comproNombre || 'No', now)
    if (compro.added) catalogosAdded++
    const cotizacionPedido = cotizNombre || ''
    const vendedor = findOrCreateCatalogItem(catalogos, 'vendedor', vendedorNombre, now)
    if (vendedor.added) catalogosAdded++
    const dept = findOrCreateCatalogItem(catalogos, 'departamento', deptNombre, now)
    if (dept.added) catalogosAdded++

    const monto = parseMonto(montoVal)
    const cotizado = parseMonto(cotizadoVal)

    const seg: Seguimiento = {
      id: uuid(),
      contacto,
      celular,
      temaId: tema.id || null,
      temaNombre: tema.nombre,
      fecha,
      periodoEtiqueta: periodoSeleccionado,
      motivoContactoId: motivo.id || null,
      motivoContactoNombre: motivo.nombre,
      comproId: compro.id || null,
      comproNombre: compro.nombre,
      cotizacionPedido,
      vendedorId: vendedor.id || null,
      vendedorNombre: vendedor.nombre,
      monto,
      cotizado,
      folioFactura: folioFactura || '',
      departamentoId: dept.id || null,
      departamentoNombre: dept.nombre,
      createdAt: now,
      updatedAt: now,
      activo: true,
    }
    seguimientosToAdd.push(seg)
  }

  if (catalogosAdded > 0) await writeCatalogos(catalogos)
  const existing = await readSeguimientos()
  await writeSeguimientos([...seguimientosToAdd, ...existing])

  return {
    ok: true,
    imported: seguimientosToAdd.length,
    skipped,
    catalogosAdded,
    errors: errors.slice(0, 50),
  }
}
