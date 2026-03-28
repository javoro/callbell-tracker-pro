/**
 * Métricas de embudo comercial para la sección Otras.
 */

import type { Seguimiento } from '@/types/seguimiento'
import type { FunnelMetrics } from '../analytics-otras-types'
import { esCotizacion, esVentaCerrada } from './analyticsRules'

export function getFunnelMetrics(seguimientos: Seguimiento[]): FunnelMetrics {
  const leads = seguimientos.length
  const cotizaciones = seguimientos.filter(esCotizacion).length
  const ventas = seguimientos.filter(esVentaCerrada).length
  const cotizacionesAbiertas = seguimientos.filter((s) => esCotizacion(s) && !esVentaCerrada(s)).length
  const conversionLeadCotizacion = leads > 0 ? (cotizaciones / leads) * 100 : 0
  const conversionCotizacionVenta = cotizaciones > 0 ? (ventas / cotizaciones) * 100 : 0
  const conversionLeadVenta = leads > 0 ? (ventas / leads) * 100 : 0

  return {
    leads,
    cotizaciones,
    ventas,
    cotizacionesAbiertas,
    conversionLeadCotizacion,
    conversionCotizacionVenta,
    conversionLeadVenta,
  }
}
