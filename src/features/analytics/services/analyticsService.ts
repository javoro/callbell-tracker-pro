/**
 * KPIs y métricas agregadas para la sección Otras.
 * Usa las reglas centralizadas de analyticsRules.
 */

import type { Seguimiento } from '@/types/seguimiento'
import type { KpiMetrics } from '../analytics-otras-types'
import { esCotizacion, esVentaCerrada } from './analyticsRules'

export function getKpiMetrics(seguimientos: Seguimiento[]): KpiMetrics {
  const leadsTotales = seguimientos.length
  const cotizaciones = seguimientos.filter(esCotizacion).length
  const ventasCerradas = seguimientos.filter(esVentaCerrada).length
  const tasaCierre = cotizaciones > 0 ? (ventasCerradas / cotizaciones) * 100 : 0
  const montoVendido = seguimientos
    .filter(esVentaCerrada)
    .reduce((sum, s) => sum + (s.monto ?? 0), 0)
  const montoCotizado = seguimientos.reduce((sum, s) => sum + (s.cotizado ?? 0), 0)
  const pipelineAbierto = seguimientos
    .filter((s) => esCotizacion(s) && !esVentaCerrada(s))
    .reduce((sum, s) => sum + (s.cotizado ?? 0), 0)
  const ticketPromedio = ventasCerradas > 0 ? montoVendido / ventasCerradas : 0

  return {
    leadsTotales,
    cotizaciones,
    ventasCerradas,
    tasaCierre,
    montoVendido,
    montoCotizado,
    pipelineAbierto,
    ticketPromedio,
  }
}
