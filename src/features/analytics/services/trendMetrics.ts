/**
 * Métricas de tendencia por fecha para la sección Otras.
 * Agrupa por día o por semana ISO.
 */

import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import type { Seguimiento } from '@/types/seguimiento'
import type { TrendPoint } from '../analytics-otras-types'
import { esCotizacion, esVentaCerrada } from './analyticsRules'

dayjs.extend(isoWeek)

export type TrendGroupBy = 'diario' | 'semanal'

export function getTrendMetrics(
  seguimientos: Seguimiento[],
  groupBy: TrendGroupBy
): TrendPoint[] {
  const map = new Map<string, { leads: number; cotizaciones: number; ventas: number; montoVendido: number }>()

  for (const s of seguimientos) {
    const fecha = (s.fecha || '').trim()
    if (!fecha || !dayjs(fecha).isValid()) continue
    const key = groupBy === 'diario' ? fecha : getSemanaKey(fecha)
    const existing = map.get(key) ?? { leads: 0, cotizaciones: 0, ventas: 0, montoVendido: 0 }
    existing.leads += 1
    if (esCotizacion(s)) existing.cotizaciones += 1
    if (esVentaCerrada(s)) {
      existing.ventas += 1
      existing.montoVendido += s.monto ?? 0
    }
    map.set(key, existing)
  }

  const sortedKeys = Array.from(map.keys()).sort()
  return sortedKeys.map((key) => {
    const v = map.get(key)!
    return {
      label: key,
      fecha: key,
      leads: v.leads,
      cotizaciones: v.cotizaciones,
      ventas: v.ventas,
      montoVendido: v.montoVendido,
    }
  })
}

function getSemanaKey(fecha: string): string {
  const d = dayjs(fecha).startOf('isoWeek')
  const weekNum = d.isoWeek()
  return `S${String(weekNum).padStart(2, '0')}-${d.year()}`
}
