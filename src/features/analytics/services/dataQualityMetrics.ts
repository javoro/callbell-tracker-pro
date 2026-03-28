/**
 * Calidad de captura: indicadores y alertas.
 */

import type { Seguimiento } from '@/types/seguimiento'
import type { DataQualityMetrics, DataQualityAlert } from '../analytics-otras-types'
import {
  tieneCelular,
  tieneVendedor,
  tieneCotizado,
  esVentaCerrada,
  esRegistroCompleto,
} from './analyticsRules'

export function getDataQualityMetrics(seguimientos: Seguimiento[]): DataQualityMetrics {
  const n = seguimientos.length
  if (n === 0) {
    return {
      pctSinCelular: 0,
      pctSinVendedor: 0,
      pctSinCotizado: 0,
      pctSinCompra: 0,
      pctRegistrosCompletos: 0,
      duplicadosPorCelular: 0,
    }
  }
  const sinCelular = seguimientos.filter((s) => !tieneCelular(s)).length
  const sinVendedor = seguimientos.filter((s) => !tieneVendedor(s)).length
  const sinCotizado = seguimientos.filter((s) => !tieneCotizado(s)).length
  const sinCompra = seguimientos.filter((s) => !(s.comproNombre ?? '').trim()).length
  const completos = seguimientos.filter(esRegistroCompleto).length
  const duplicadosPorCelular = countDuplicadosPorCelular(seguimientos)

  return {
    pctSinCelular: (sinCelular / n) * 100,
    pctSinVendedor: (sinVendedor / n) * 100,
    pctSinCotizado: (sinCotizado / n) * 100,
    pctSinCompra: (sinCompra / n) * 100,
    pctRegistrosCompletos: (completos / n) * 100,
    duplicadosPorCelular,
  }
}

function countDuplicadosPorCelular(seguimientos: Seguimiento[]): number {
  const byCelular = new Map<string, Seguimiento[]>()
  for (const s of seguimientos) {
    const cel = (s.celular ?? '').trim()
    if (cel === '') continue
    const list = byCelular.get(cel) ?? []
    list.push(s)
    byCelular.set(cel, list)
  }
  let count = 0
  for (const list of byCelular.values()) {
    if (list.length > 1) count += list.length
  }
  return count
}

export function getDataQualityAlerts(seguimientos: Seguimiento[]): DataQualityAlert[] {
  const alerts: DataQualityAlert[] = []
  const sinCelular = seguimientos.filter((s) => !tieneCelular(s))
  if (sinCelular.length > 0) {
    alerts.push({
      tipo: 'sin_celular',
      mensaje: 'Registros sin celular',
      cantidad: sinCelular.length,
      ids: sinCelular.slice(0, 50).map((s) => s.id),
    })
  }
  const sinVendedor = seguimientos.filter((s) => !tieneVendedor(s))
  if (sinVendedor.length > 0) {
    alerts.push({
      tipo: 'sin_vendedor',
      mensaje: 'Registros sin vendedor',
      cantidad: sinVendedor.length,
      ids: sinVendedor.slice(0, 50).map((s) => s.id),
    })
  }
  const compraSinMonto = seguimientos.filter((s) => esVentaCerrada(s) && (s.monto == null || s.monto === 0))
  if (compraSinMonto.length > 0) {
    alerts.push({
      tipo: 'compra_sin_monto',
      mensaje: 'Registros con compra pero monto vacío o cero',
      cantidad: compraSinMonto.length,
      ids: compraSinMonto.slice(0, 50).map((s) => s.id),
    })
  }
  const cotizadoIncompleto = seguimientos.filter(
    (s) => (s.cotizado != null && s.cotizado > 0) && !esVentaCerrada(s) && (!s.comproNombre || (s.comproNombre ?? '').trim() === '')
  )
  if (cotizadoIncompleto.length > 0) {
    alerts.push({
      tipo: 'cotizado_incompleto',
      mensaje: 'Registros con cotizado pero sin compra definida',
      cantidad: cotizadoIncompleto.length,
      ids: cotizadoIncompleto.slice(0, 50).map((s) => s.id),
    })
  }
  const byCelular = new Map<string, Seguimiento[]>()
  for (const s of seguimientos) {
    const cel = (s.celular ?? '').trim()
    if (cel === '') continue
    const list = byCelular.get(cel) ?? []
    list.push(s)
    byCelular.set(cel, list)
  }
  const duplicados = Array.from(byCelular.entries()).filter(([, list]) => list.length > 1)
  if (duplicados.length > 0) {
    const totalDup = duplicados.reduce((sum, [, list]) => sum + list.length, 0)
    alerts.push({
      tipo: 'duplicado_celular',
      mensaje: `Posibles duplicados por celular (${duplicados.length} celdas con más de un registro)`,
      cantidad: totalDup,
      ids: duplicados.flatMap(([, list]) => list.map((s) => s.id)).slice(0, 50),
    })
  }
  return alerts
}
