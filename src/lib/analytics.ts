import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import type { Seguimiento } from '@/types/seguimiento'

dayjs.extend(isoWeek)

/**
 * Lunes (inicio del día) de la semana ISO `isoWeek` dentro del año ISO `isoYear`.
 * El 4 de enero cae siempre en la semana ISO 1 de su año ISO (convención estándar).
 *
 * Nota: dayjs solo expone `isoWeekYear()` como getter (número), no como setter encadenable;
 * por eso no se puede usar `dayjs().isoWeekYear(y).isoWeek(w)`.
 */
function startOfIsoWeekInYear(isoYear: number, isoWeek: number): dayjs.Dayjs {
  const week1Monday = dayjs(`${isoYear}-01-04`).startOf('isoWeek')
  return week1Monday.add(isoWeek - 1, 'week').startOf('day')
}

function endOfIsoWeekInYear(isoYear: number, isoWeek: number): dayjs.Dayjs {
  return startOfIsoWeekInYear(isoYear, isoWeek).add(6, 'day').endOf('day')
}

const SIN_ESPECIFICAR = 'Sin especificar'

function esConcretadaVenta(s: Seguimiento): boolean {
  const n = (s.comproNombre || '').trim().toLowerCase()
  return n === 'sí' || n === 'si'
}

function tieneCotizacion(s: Seguimiento): boolean {
  const hasCotizado = s.cotizado != null && s.cotizado > 0
  const hasCotizacionPedido =
    (s.cotizacionPedido ?? '').trim() !== '' && s.cotizacionPedido !== SIN_ESPECIFICAR
  return hasCotizado || !!hasCotizacionPedido
}

/** Devuelve la etiqueta de semana ISO (S01..S53) para una fecha YYYY-MM-DD. */
export function getSemanaEtiqueta(fecha: string): string {
  const d = dayjs(fecha)
  const num = d.isoWeek()
  return `S${String(num).padStart(2, '0')}`
}

function getInicioSemana(fecha: string): dayjs.Dayjs {
  return dayjs(fecha).startOf('isoWeek')
}

export interface MetricasSemana {
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

export interface Deltas {
  leads: number
  cotizaciones: number
  concretadas: number
}

export interface AnalyticsData {
  semanaActual: MetricasSemana
  semanaAnterior: MetricasSemana | null
  deltas: Deltas
  metaSemanal: number | null
  porcentajeMeta: number | null
}

function calcularMetricas(registros: Seguimiento[], etiqueta: string, inicio: string, fin: string): MetricasSemana {
  const leadsTotales = registros.length
  const conCotizacion = registros.filter(tieneCotizacion)
  const cotizaciones = conCotizacion.length
  const concretadas = registros.filter(esConcretadaVenta)
  const cotizacionesEnSeguimiento = registros.filter(
    (s) => tieneCotizacion(s) && !esConcretadaVenta(s)
  ).length
  const ventas = concretadas.reduce((sum, s) => sum + (s.monto ?? 0), 0)
  const ticketPromedio = concretadas.length > 0 ? ventas / concretadas.length : 0

  return {
    etiqueta,
    inicio,
    fin,
    leadsTotales,
    cotizaciones,
    cotizacionesEnSeguimiento,
    concretadasEnVenta: concretadas.length,
    ventas,
    ticketPromedio,
  }
}

/** Filtro de periodo para analíticas (semana ISO + año ISO). */
export type AnalyticsPeriodFilter =
  | { mode: 'default' }
  | { mode: 'week'; isoYear: number; isoWeek: number }
  | { mode: 'range'; yearFrom: number; weekFrom: number; yearTo: number; weekTo: number }

function inRangeFecha(s: Seguimiento, start: dayjs.Dayjs, end: dayjs.Dayjs): boolean {
  const d = dayjs(s.fecha)
  if (!d.isValid()) return false
  return !d.isBefore(start, 'day') && !d.isAfter(end, 'day')
}

/** Límites [inicio lunes, fin domingo] para un rango de semanas ISO (inclusive). Orden desde/hasta intercambiable. */
function boundsIsoWeekRange(
  yearFrom: number,
  weekFrom: number,
  yearTo: number,
  weekTo: number
): { start: dayjs.Dayjs; end: dayjs.Dayjs } {
  const startA = startOfIsoWeekInYear(yearFrom, weekFrom)
  const endA = endOfIsoWeekInYear(yearFrom, weekFrom)
  const startB = startOfIsoWeekInYear(yearTo, weekTo)
  const endB = endOfIsoWeekInYear(yearTo, weekTo)
  const start = startA.isBefore(startB, 'day') ? startA : startB
  const end = endA.isAfter(endB, 'day') ? endA : endB
  return { start, end }
}

/** Registros activos cuyo `fecha` cae en la semana ISO indicada. */
export function seguimientoEnSemanaIso(fecha: string, isoWeek: number, isoYear: number): boolean {
  const d = dayjs(fecha)
  if (!d.isValid()) return false
  return d.isoWeek() === isoWeek && d.isoWeekYear() === isoYear
}

/**
 * Filtra seguimientos activos según el periodo elegido (para KPI, embudo, etc.).
 */
export function filterSeguimientosByAnalyticsPeriod(
  seguimientos: Seguimiento[],
  filter: AnalyticsPeriodFilter
): Seguimiento[] {
  const activos = seguimientos.filter((s) => s.activo)
  if (filter.mode === 'default') return activos
  if (filter.mode === 'week') {
    return activos.filter((s) => seguimientoEnSemanaIso(s.fecha, filter.isoWeek, filter.isoYear))
  }
  const { start, end } = boundsIsoWeekRange(
    filter.yearFrom,
    filter.weekFrom,
    filter.yearTo,
    filter.weekTo
  )
  return activos.filter((s) => inRangeFecha(s, start, end))
}

/**
 * Agrupa seguimientos por semana ISO (lunes a domingo) y calcula métricas
 * para la semana actual y la anterior, más deltas y opcional meta semanal.
 *
 * Con `periodFilter` puede anclarse a una semana concreta o a un rango de semanas;
 * en rango no hay "semana anterior" ni deltas (se devuelven en cero / null según aplique).
 */
export function computeAnalytics(
  seguimientos: Seguimiento[],
  metaSemanal: number | null = null,
  periodFilter: AnalyticsPeriodFilter = { mode: 'default' }
): AnalyticsData {
  const activos = seguimientos.filter((s) => s.activo)

  const inRange = (s: Seguimiento, start: dayjs.Dayjs, end: dayjs.Dayjs) =>
    inRangeFecha(s, start, end)

  if (periodFilter.mode === 'range') {
    const { start, end } = boundsIsoWeekRange(
      periodFilter.yearFrom,
      periodFilter.weekFrom,
      periodFilter.yearTo,
      periodFilter.weekTo
    )
    const registros = activos.filter((s) => inRange(s, start, end))
    const w1 = `S${String(start.isoWeek()).padStart(2, '0')}`
    const w2 = `S${String(end.isoWeek()).padStart(2, '0')}`
    const y1 = start.isoWeekYear()
    const y2 = end.isoWeekYear()
    const etiqueta =
      y1 === y2 ? `${w1}–${w2} (${y1})` : `${w1} ${y1} – ${w2} ${y2}`
    const semanaActual = calcularMetricas(
      registros,
      etiqueta,
      start.format('YYYY-MM-DD'),
      end.format('YYYY-MM-DD')
    )
    const weeksCount = Math.max(1, end.startOf('isoWeek').diff(start.startOf('isoWeek'), 'week') + 1)
    let porcentajeMeta: number | null = null
    if (metaSemanal != null && metaSemanal > 0) {
      porcentajeMeta = (semanaActual.ventas / (metaSemanal * weeksCount)) * 100
    }
    return {
      semanaActual,
      semanaAnterior: null,
      deltas: { leads: 0, cotizaciones: 0, concretadas: 0 },
      metaSemanal,
      porcentajeMeta,
    }
  }

  let inicioActual: dayjs.Dayjs
  let finActual: dayjs.Dayjs
  let etiquetaActual: string

  if (periodFilter.mode === 'week') {
    inicioActual = startOfIsoWeekInYear(periodFilter.isoYear, periodFilter.isoWeek)
    finActual = inicioActual.add(6, 'day').endOf('day')
    etiquetaActual = `S${String(periodFilter.isoWeek).padStart(2, '0')} (${periodFilter.isoYear})`
  } else {
    const hoy = dayjs()
    inicioActual = hoy.startOf('isoWeek')
    finActual = inicioActual.add(6, 'day').endOf('day')
    etiquetaActual = `S${String(inicioActual.isoWeek()).padStart(2, '0')} (${inicioActual.isoWeekYear()})`
  }

  const inicioAnterior = inicioActual.subtract(1, 'week').startOf('day')
  const finAnterior = inicioAnterior.add(6, 'day').endOf('day')
  const etiquetaAnterior = `S${String(inicioAnterior.isoWeek()).padStart(2, '0')} (${inicioAnterior.isoWeekYear()})`

  const registrosActual = activos.filter((s) => inRange(s, inicioActual, finActual))
  const registrosAnterior = activos.filter((s) => inRange(s, inicioAnterior, finAnterior))

  const semanaActual = calcularMetricas(
    registrosActual,
    etiquetaActual,
    inicioActual.format('YYYY-MM-DD'),
    finActual.format('YYYY-MM-DD')
  )
  const semanaAnterior = calcularMetricas(
    registrosAnterior,
    etiquetaAnterior,
    inicioAnterior.format('YYYY-MM-DD'),
    finAnterior.format('YYYY-MM-DD')
  )

  const deltas: Deltas = {
    leads: semanaActual.leadsTotales - semanaAnterior.leadsTotales,
    cotizaciones: semanaActual.cotizaciones - semanaAnterior.cotizaciones,
    concretadas: semanaActual.concretadasEnVenta - semanaAnterior.concretadasEnVenta,
  }

  let porcentajeMeta: number | null = null
  if (metaSemanal != null && metaSemanal > 0) {
    porcentajeMeta = (semanaActual.ventas / metaSemanal) * 100
  }

  return {
    semanaActual,
    semanaAnterior,
    deltas,
    metaSemanal,
    porcentajeMeta,
  }
}

export { getInicioSemana }
