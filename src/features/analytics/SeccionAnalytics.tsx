import { Button } from '@/components/ui/button'
import { useLicenseStore } from '@/store/license-store'
import { Label } from '@/components/ui/label'
import { formatMoney } from '@/lib/utils'
import {
  computeAnalytics,
  filterSeguimientosByAnalyticsPeriod,
  type AnalyticsPeriodFilter,
} from '@/lib/analytics'
import { useSeguimientoStore } from '@/store/seguimiento-store'
import { FileSpreadsheet, Loader2, Presentation } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import { OtherAnalyticsSection, type TrendPresentationMeta } from './OtherAnalyticsSection'
import { getKpiMetrics } from './services/analyticsService'
import { getFunnelMetrics } from './services/funnelMetrics'
import { getTrendMetrics } from './services/trendMetrics'
import { getVendorRanking } from './services/vendorMetrics'
import { getOpenPipeline } from './services/pipelineMetrics'
import { getDataQualityMetrics, getDataQualityAlerts } from './services/dataQualityMetrics'
import type { FullAnalyticsExportPayload } from './analytics-otras-types'
import { captureAnalyticsSnapshots } from './captureAnalyticsScreenshots'

dayjs.extend(isoWeek)

function formatDelta(n: number): string {
  if (n === 0) return ''
  if (n > 0) return ` (+${n})`
  return ` (${n})`
}

interface SeccionAnalyticsProps {
  onExportExcel: (data: FullAnalyticsExportPayload) => Promise<void>
  onExportPowerPoint?: (data: FullAnalyticsExportPayload) => Promise<void>
  /** Si es false, se deshabilitan exportaciones desde esta sección. */
  enableExportExcel?: boolean
}

const SEMANAS_ISO = Array.from({ length: 53 }, (_, i) => i + 1)

function yearOptionsForAnalytics(): number[] {
  const y = dayjs().isoWeekYear()
  const from = Math.min(y - 5, y)
  const to = y + 1
  const list: number[] = []
  for (let a = from; a <= to; a++) list.push(a)
  return list
}

export function SeccionAnalytics({
  onExportExcel,
  onExportPowerPoint,
  enableExportExcel = true,
}: SeccionAnalyticsProps) {
  const seguimientos = useSeguimientoStore((s) => s.seguimientos)
  const config = useSeguimientoStore((s) => s.config)
  const [exporting, setExporting] = useState(false)
  const [exportingPpt, setExportingPpt] = useState(false)
  const refPeriodoYRelevantes = useRef<HTMLDivElement>(null)
  const refOtras = useRef<HTMLElement>(null)
  const refRelevantesCard = useRef<HTMLDivElement>(null)
  const refKpiCapture = useRef<HTMLDivElement>(null)
  const refFunnelCapture = useRef<HTMLDivElement>(null)
  const refTrendCapture = useRef<HTMLDivElement>(null)
  const trendPresentationMetaRef = useRef<TrendPresentationMeta | null>(null)

  const [periodMode, setPeriodMode] = useState<'default' | 'week' | 'range'>('default')
  const [weekNum, setWeekNum] = useState(() => dayjs().isoWeek())
  const [weekYear, setWeekYear] = useState(() => dayjs().isoWeekYear())
  const [rangeFromW, setRangeFromW] = useState(() => Math.max(1, dayjs().isoWeek() - 3))
  const [rangeFromY, setRangeFromY] = useState(() => dayjs().isoWeekYear())
  const [rangeToW, setRangeToW] = useState(() => dayjs().isoWeek())
  const [rangeToY, setRangeToY] = useState(() => dayjs().isoWeekYear())

  const periodFilter = useMemo<AnalyticsPeriodFilter>(() => {
    if (periodMode === 'default') return { mode: 'default' }
    if (periodMode === 'week') return { mode: 'week', isoWeek: weekNum, isoYear: weekYear }
    return {
      mode: 'range',
      weekFrom: rangeFromW,
      yearFrom: rangeFromY,
      weekTo: rangeToW,
      yearTo: rangeToY,
    }
  }, [periodMode, weekNum, weekYear, rangeFromW, rangeFromY, rangeToW, rangeToY])

  const metaSemanal = config?.metaSemanal ?? null
  const hasPermiso = useLicenseStore((s) => s.hasPermiso)
  const relevantes = useMemo(
    () => computeAnalytics(seguimientos, metaSemanal ?? null, periodFilter),
    [seguimientos, metaSemanal, periodFilter]
  )
  const { semanaActual, semanaAnterior, deltas, porcentajeMeta } = relevantes

  const activosFiltrados = useMemo(
    () => filterSeguimientosByAnalyticsPeriod(seguimientos, periodFilter),
    [seguimientos, periodFilter]
  )

  const kpi = useMemo(() => getKpiMetrics(activosFiltrados), [activosFiltrados])
  const funnel = useMemo(() => getFunnelMetrics(activosFiltrados), [activosFiltrados])
  const trend = useMemo(() => getTrendMetrics(activosFiltrados, 'semanal'), [activosFiltrados])
  const vendor = useMemo(() => getVendorRanking(activosFiltrados), [activosFiltrados])
  const pipeline = useMemo(() => getOpenPipeline(activosFiltrados), [activosFiltrados])
  const qualityMetrics = useMemo(() => getDataQualityMetrics(activosFiltrados), [activosFiltrados])
  const qualityAlerts = useMemo(() => getDataQualityAlerts(activosFiltrados), [activosFiltrados])

  const yearOptions = useMemo(() => yearOptionsForAnalytics(), [])

  async function buildAnalyticsExportPayload(): Promise<FullAnalyticsExportPayload> {
    const [screenshots, layoutShots] = await Promise.all([
      captureAnalyticsSnapshots([
        { title: 'Periodo de cálculo y relevantes', element: refPeriodoYRelevantes.current },
        { title: 'Otras — gráficos y tablas (KPI, funnel, tendencia, ranking, pipeline, calidad)', element: refOtras.current },
      ]),
      captureAnalyticsSnapshots([
        { title: 'Relevantes', element: refRelevantesCard.current },
        { title: 'Resumen ejecutivo adicional (KPI)', element: refKpiCapture.current },
        { title: 'Funnel comercial', element: refFunnelCapture.current },
        { title: 'Tendencia por fecha', element: refTrendCapture.current },
      ]),
    ])
    const relevantesScreenshot = layoutShots.find((s) => s.title === 'Relevantes')
    const kpiCardsScreenshot = layoutShots.find((s) => s.title === 'Resumen ejecutivo adicional (KPI)')
    const funnelScreenshot = layoutShots.find((s) => s.title === 'Funnel comercial')
    const trendScreenshot = layoutShots.find((s) => s.title === 'Tendencia por fecha')
    const meta = trendPresentationMetaRef.current
    return {
      relevantes,
      kpi,
      funnel,
      trend,
      vendor,
      pipeline,
      quality: { metrics: qualityMetrics, alerts: qualityAlerts },
      screenshots,
      relevantesScreenshot,
      kpiCardsScreenshot,
      funnelScreenshot,
      trendScreenshot,
      trendPresentationMeta: meta
        ? { agrupacion: meta.agrupacion, vista: meta.vista }
        : { agrupacion: 'semanal', vista: 'barras' },
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const payload = await buildAnalyticsExportPayload()
      await onExportExcel(payload)
    } finally {
      setExporting(false)
    }
  }

  const handleExportPowerPoint = async () => {
    if (!onExportPowerPoint) return
    setExportingPpt(true)
    try {
      const payload = await buildAnalyticsExportPayload()
      await onExportPowerPoint(payload)
    } finally {
      setExportingPpt(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Analíticas</h2>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            disabled={exporting || exportingPpt || !enableExportExcel || !hasPermiso('analytics_export_excel')}
            title={!hasPermiso('analytics_export_excel') ? 'Tu licencia no incluye esta función' : !enableExportExcel ? 'Exportación deshabilitada en esta vista' : undefined}
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
            Exportar a Excel
          </Button>
          {onExportPowerPoint && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportPowerPoint}
              disabled={exporting || exportingPpt || !enableExportExcel || !hasPermiso('analytics_export_ppt')}
              title={!hasPermiso('analytics_export_ppt') ? 'Tu licencia no incluye esta función' : !enableExportExcel ? 'Exportación deshabilitada en esta vista' : 'Generar presentación PowerPoint'}
            >
              {exportingPpt ? <Loader2 className="h-4 w-4 animate-spin" /> : <Presentation className="h-4 w-4" />}
              Crear presentación
            </Button>
          )}
        </div>
      </div>

      <div
        ref={refPeriodoYRelevantes}
        className="space-y-4 rounded-lg border border-transparent p-1"
      >
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm space-y-3">
        <p className="text-sm font-medium text-foreground">Periodo de los cálculos</p>
        <p className="text-xs text-muted-foreground">
          Semanas según calendario ISO (lunes a domingo). “Relevantes” compara con la semana ISO anterior
          salvo en rango, donde se muestran totales acumulados.
        </p>
        {hasPermiso('analytics_filters') ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={periodMode === 'default' ? 'default' : 'outline'}
                onClick={() => setPeriodMode('default')}
              >
                Semana actual (calendario)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={periodMode === 'week' ? 'default' : 'outline'}
                onClick={() => setPeriodMode('week')}
              >
                Una semana
              </Button>
              <Button
                type="button"
                size="sm"
                variant={periodMode === 'range' ? 'default' : 'outline'}
                onClick={() => setPeriodMode('range')}
              >
                Rango de semanas
              </Button>
            </div>
            {periodMode === 'week' && (
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <Label className="text-xs">Semana</Label>
                  <select
                    className="flex h-9 min-w-[5.5rem] rounded-md border border-input bg-background px-2 py-1 text-sm mt-1"
                    value={weekNum}
                    onChange={(e) => setWeekNum(Number(e.target.value))}
                  >
                    {SEMANAS_ISO.map((n) => (
                      <option key={n} value={n}>
                        S{String(n).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Año ISO</Label>
                  <select
                    className="flex h-9 min-w-[5rem] rounded-md border border-input bg-background px-2 py-1 text-sm mt-1"
                    value={weekYear}
                    onChange={(e) => setWeekYear(Number(e.target.value))}
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {periodMode === 'range' && (
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex flex-wrap items-end gap-2">
                  <span className="text-xs text-muted-foreground w-full sm:w-auto">Desde</span>
                  <div>
                    <Label className="text-xs">Semana</Label>
                    <select
                      className="flex h-9 min-w-[5.5rem] rounded-md border border-input bg-background px-2 py-1 text-sm mt-1"
                      value={rangeFromW}
                      onChange={(e) => setRangeFromW(Number(e.target.value))}
                    >
                      {SEMANAS_ISO.map((n) => (
                        <option key={n} value={n}>
                          S{String(n).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Año ISO</Label>
                    <select
                      className="flex h-9 min-w-[5rem] rounded-md border border-input bg-background px-2 py-1 text-sm mt-1"
                      value={rangeFromY}
                      onChange={(e) => setRangeFromY(Number(e.target.value))}
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <span className="text-xs text-muted-foreground w-full sm:w-auto">Hasta</span>
                  <div>
                    <Label className="text-xs">Semana</Label>
                    <select
                      className="flex h-9 min-w-[5.5rem] rounded-md border border-input bg-background px-2 py-1 text-sm mt-1"
                      value={rangeToW}
                      onChange={(e) => setRangeToW(Number(e.target.value))}
                    >
                      {SEMANAS_ISO.map((n) => (
                        <option key={n} value={n}>
                          S{String(n).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Año ISO</Label>
                    <select
                      className="flex h-9 min-w-[5rem] rounded-md border border-input bg-background px-2 py-1 text-sm mt-1"
                      value={rangeToY}
                      onChange={(e) => setRangeToY(Number(e.target.value))}
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-muted-foreground italic">Los filtros de periodo no están disponibles en tu licencia. Se usa la semana actual (calendario).</p>
        )}
      </div>

      <div
        ref={refRelevantesCard}
        className="rounded-lg border border-border overflow-hidden bg-[#e8f5e9] shadow-sm"
      >
        <div className="px-4 py-2 border-b border-border/60 bg-[#c8e6c9]">
          <span className="font-medium text-foreground">Relevantes:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Columna izquierda: embudo */}
          <div className="p-4 md:border-r border-border/60 space-y-2">
            <p className="text-sm text-foreground">
              <span className="font-medium">Leads totales {semanaActual.etiqueta}:</span>{' '}
              {semanaActual.leadsTotales}
              {semanaAnterior && formatDelta(deltas.leads)}
            </p>
            <p className="text-sm text-foreground">
              <span className="font-medium">Cotizaciones:</span> {semanaActual.cotizaciones}
              {semanaAnterior && formatDelta(deltas.cotizaciones)}
            </p>
            <p className="text-sm text-foreground">
              <span className="font-medium">Cotizaciones en seguimiento:</span>{' '}
              {semanaActual.cotizacionesEnSeguimiento}
            </p>
            <p className="text-sm text-foreground">
              <span className="font-medium">Cotizaciones concretadas en venta:</span>{' '}
              {semanaActual.concretadasEnVenta}
              {semanaAnterior && formatDelta(deltas.concretadas)}
            </p>
          </div>
          {/* Columna derecha: ventas y ticket */}
          <div className="p-4 space-y-2">
            {semanaAnterior && (
              <>
                <p className="text-sm text-foreground">
                  <span className="font-medium">Ventas {semanaAnterior.etiqueta}:</span>{' '}
                  {formatMoney(semanaAnterior.ventas)}
                </p>
                <p className="text-sm text-foreground">
                  <span className="font-medium">Ticket promedio {semanaAnterior.etiqueta}:</span>{' '}
                  {formatMoney(semanaAnterior.ticketPromedio)}
                </p>
              </>
            )}
            <p className="text-sm text-foreground">
              <span className="font-medium">Ventas {semanaActual.etiqueta}:</span>{' '}
              {formatMoney(semanaActual.ventas)}
            </p>
            <p className="text-sm text-foreground">
              <span className="font-medium">Ticket promedio {semanaActual.etiqueta}:</span>{' '}
              {formatMoney(semanaActual.ticketPromedio)}
            </p>
            {metaSemanal != null && metaSemanal > 0 && porcentajeMeta != null && (
              <p className="text-sm text-foreground">
                <span className="font-medium">
                  {porcentajeMeta >= 0 ? '+' : ''}
                  {porcentajeMeta.toFixed(2)}% de la meta semanal
                  {periodMode === 'range' ? ' (proporcional al número de semanas del rango)' : ''}.
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
      </div>

      <OtherAnalyticsSection
        ref={refOtras}
        seguimientos={activosFiltrados}
        kpiCaptureRef={refKpiCapture}
        funnelCaptureRef={refFunnelCapture}
        trendCaptureRef={refTrendCapture}
        trendPresentationMetaRef={trendPresentationMetaRef}
      />
    </div>
  )
}
