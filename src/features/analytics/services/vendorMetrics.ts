/**
 * Ranking por vendedor para la sección Otras.
 * Sin vendedor se agrupa como "Sin asignar". Orden por monto vendido descendente.
 */

import type { Seguimiento } from '@/types/seguimiento'
import type { VendorPerformanceRow } from '../analytics-otras-types'
import { esCotizacion, esVentaCerrada } from './analyticsRules'

const SIN_ASIGNAR = 'Sin asignar'

export function getVendorRanking(seguimientos: Seguimiento[]): VendorPerformanceRow[] {
  const byVendor = new Map<string, Seguimiento[]>()
  for (const s of seguimientos) {
    const name = (s.vendedorNombre ?? '').trim() === '' || (s.vendedorNombre ?? '').trim() === 'Sin especificar'
      ? SIN_ASIGNAR
      : (s.vendedorNombre ?? '').trim()
    const list = byVendor.get(name) ?? []
    list.push(s)
    byVendor.set(name, list)
  }

  const rows: VendorPerformanceRow[] = []
  for (const [vendedor, list] of byVendor) {
    const leads = list.length
    const cotizaciones = list.filter(esCotizacion).length
    const ventas = list.filter(esVentaCerrada).length
    const tasaCierre = cotizaciones > 0 ? (ventas / cotizaciones) * 100 : 0
    const montoVendido = list.filter(esVentaCerrada).reduce((sum, s) => sum + (s.monto ?? 0), 0)
    const montoCotizado = list.reduce((sum, s) => sum + (s.cotizado ?? 0), 0)
    const ticketPromedio = ventas > 0 ? montoVendido / ventas : 0
    rows.push({
      vendedor,
      leads,
      cotizaciones,
      ventas,
      tasaCierre,
      montoVendido,
      montoCotizado,
      ticketPromedio,
    })
  }
  rows.sort((a, b) => b.montoVendido - a.montoVendido)
  return rows
}
