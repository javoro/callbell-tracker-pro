/**
 * Tipos para la sección "Otras" de Analíticas.
 * Centralizados para mantener consistencia y facilitar ajustes.
 */
import type { AnalyticsData } from '@/lib/analytics'

export interface KpiMetrics {
  leadsTotales: number
  cotizaciones: number
  ventasCerradas: number
  tasaCierre: number
  montoVendido: number
  montoCotizado: number
  pipelineAbierto: number
  ticketPromedio: number
}

export interface FunnelMetrics {
  leads: number
  cotizaciones: number
  ventas: number
  cotizacionesAbiertas: number
  conversionLeadCotizacion: number
  conversionCotizacionVenta: number
  conversionLeadVenta: number
}

export interface TrendPoint {
  label: string
  fecha: string
  leads: number
  cotizaciones: number
  ventas: number
  montoVendido: number
}

export interface VendorPerformanceRow {
  vendedor: string
  leads: number
  cotizaciones: number
  ventas: number
  tasaCierre: number
  montoVendido: number
  montoCotizado: number
  ticketPromedio: number
}

export type SemaphoreStatus = 'verde' | 'amarillo' | 'rojo'

export interface PipelineRow {
  id: string
  contacto: string
  fecha: string
  celular: string
  vendedor: string
  cotizado: number
  diasAbierta: number
  semaforo: SemaphoreStatus
}

export interface DataQualityMetrics {
  pctSinCelular: number
  pctSinVendedor: number
  pctSinCotizado: number
  pctSinCompra: number
  pctRegistrosCompletos: number
  duplicadosPorCelular: number
}

export interface DataQualityAlert {
  tipo: 'sin_celular' | 'sin_vendedor' | 'compra_sin_monto' | 'cotizado_incompleto' | 'duplicado_celular'
  mensaje: string
  cantidad: number
  ids?: string[]
}

/** Captura de pantalla generada en el cliente para la hoja “Vista en pantalla”. */
export interface AnalyticsScreenshotExport {
  title: string
  imageBase64: string
  width: number
  height: number
}

/**
 * Payload completo que se exporta a Excel para la pantalla de Analíticas.
 * Incluye la sección Relevantes y todas las métricas de Otras.
 */
export interface FullAnalyticsExportPayload {
  relevantes: AnalyticsData
  kpi: KpiMetrics
  funnel: FunnelMetrics
  trend: TrendPoint[]
  vendor: VendorPerformanceRow[]
  pipeline: PipelineRow[]
  quality: {
    metrics: DataQualityMetrics
    alerts: DataQualityAlert[]
  }
  /** Imágenes opcionales (PNG) que reflejan la UI tal como se ve en pantalla. */
  screenshots?: AnalyticsScreenshotExport[]
  /** Solo la tarjeta Relevantes (dos columnas como en pantalla). */
  relevantesScreenshot?: AnalyticsScreenshotExport
  /** Bloque “Resumen ejecutivo adicional” con las 8 tarjetas KPI. */
  kpiCardsScreenshot?: AnalyticsScreenshotExport
  /** Captura del bloque Funnel comercial (misma vista que en pantalla). */
  funnelScreenshot?: AnalyticsScreenshotExport
  /** Captura de Tendencia por fecha (barras o gráfica de líneas según selección). */
  trendScreenshot?: AnalyticsScreenshotExport
  /** Cómo estaba configurada la tendencia al exportar (para subtítulo en PPT). */
  trendPresentationMeta?: {
    agrupacion: 'diario' | 'semanal'
    vista: 'barras' | 'lineas'
  }
}
