/**
 * Pipeline abierto: registros con cotización que no cerraron en venta.
 * Incluye días abierta y semáforo (verde 0-2, amarillo 3-7, rojo 8+).
 */

import dayjs from 'dayjs'
import type { Seguimiento } from '@/types/seguimiento'
import type { PipelineRow, SemaphoreStatus } from '../analytics-otras-types'
import { esCotizacion, esVentaCerrada } from './analyticsRules'

export function getOpenPipeline(seguimientos: Seguimiento[]): PipelineRow[] {
  const hoy = dayjs().startOf('day')
  const open = seguimientos.filter((s) => esCotizacion(s) && !esVentaCerrada(s) && s.activo)
  const rows: PipelineRow[] = open.map((s) => {
    const fecha = (s.fecha || '').trim()
    const d = dayjs(fecha).isValid() ? dayjs(fecha).startOf('day') : hoy
    const diasAbierta = Math.max(0, hoy.diff(d, 'day'))
    const semaforo = getSemaforo(diasAbierta)
    return {
      id: s.id,
      contacto: (s.contacto ?? '').trim() || '—',
      fecha: fecha || '—',
      celular: (s.celular ?? '').trim() || '—',
      vendedor: (s.vendedorNombre ?? '').trim() || 'Sin asignar',
      cotizado: s.cotizado ?? 0,
      diasAbierta,
      semaforo,
    }
  })
  rows.sort((a, b) => b.diasAbierta - a.diasAbierta)
  return rows
}

function getSemaforo(dias: number): SemaphoreStatus {
  if (dias <= 2) return 'verde'
  if (dias <= 7) return 'amarillo'
  return 'rojo'
}
