import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import type { Configuracion } from '@/types/configuracion'

dayjs.extend(isoWeek)

export type PeriodoActivo = { inicio: string; fin: string; etiqueta?: string }

/**
 * Calcula el rango [inicio, fin] del periodo de corte vigente según la configuración.
 * - diario: hoy
 * - semanal: semana actual de lunes a domingo, etiqueta S01..S53 según semana del año (ISO)
 * - personalizado: fechaInicioPersonalizada a fechaFinPersonalizada
 */
export function getPeriodoActivo(config: Configuracion): PeriodoActivo {
  const hoy = dayjs()
  switch (config.tipoCorte) {
    case 'diario':
      return {
        inicio: hoy.format('YYYY-MM-DD'),
        fin: hoy.format('YYYY-MM-DD'),
      }
    case 'semanal': {
      const inicio = hoy.startOf('isoWeek')
      const fin = inicio.add(6, 'day')
      const numSemana = inicio.isoWeek()
      const etiqueta = `S${String(numSemana).padStart(2, '0')}`
      return {
        inicio: inicio.format('YYYY-MM-DD'),
        fin: fin.format('YYYY-MM-DD'),
        etiqueta,
      }
    }
    case 'personalizado':
      return {
        inicio: config.fechaInicioPersonalizada || hoy.format('YYYY-MM-DD'),
        fin: config.fechaFinPersonalizada || hoy.format('YYYY-MM-DD'),
      }
    default:
      return {
        inicio: hoy.format('YYYY-MM-DD'),
        fin: hoy.format('YYYY-MM-DD'),
      }
  }
}

export function estaEnPeriodo(fecha: string, inicio: string, fin: string): boolean {
  const d = dayjs(fecha)
  return !d.isBefore(dayjs(inicio), 'day') && !d.isAfter(dayjs(fin), 'day')
}
