import { create } from 'zustand'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import type { Seguimiento } from '@/types/seguimiento'
import type { Configuracion } from '@/types/configuracion'

dayjs.extend(isoWeek)

export interface FiltrosState {
  fechaInicio: string
  fechaFin: string
  /** Semana ISO 1–53; vacío = sin filtrar por semana */
  semanaIso: string
  /** Año ISO; vacío = sin filtrar por semana */
  añoIso: string
  motivoId: string
  comproId: string
  montoMin: string
  montoMax: string
  cotizadoMin: string
  cotizadoMax: string
  busquedaLibre: string
}

const defaultFiltros = (): FiltrosState => ({
  fechaInicio: '',
  fechaFin: '',
  semanaIso: '',
  añoIso: '',
  motivoId: '',
  comproId: '',
  montoMin: '',
  montoMax: '',
  cotizadoMin: '',
  cotizadoMax: '',
  busquedaLibre: '',
})

interface SeguimientoStore {
  seguimientos: Seguimiento[]
  config: Configuracion | null
  periodoActivo: { inicio: string; fin: string; etiqueta?: string } | null
  filtros: FiltrosState
  loading: boolean
  error: string | null
  setSeguimientos: (s: Seguimiento[]) => void
  setConfig: (c: Configuracion | null) => void
  setPeriodoActivo: (p: { inicio: string; fin: string; etiqueta?: string } | null) => void
  setFiltro: <K extends keyof FiltrosState>(key: K, value: FiltrosState[K]) => void
  resetFiltros: () => void
  setLoading: (v: boolean) => void
  setError: (e: string | null) => void
  addSeguimiento: (s: Seguimiento) => void
  updateSeguimiento: (s: Seguimiento) => void
  removeSeguimiento: (id: string) => void
  removeSeguimientos: (ids: string[]) => void
  /** Listado filtrado (sin recorte automático por periodo de configuración). El orden en UI es por fecha en la tabla. */
  listadoVisible: () => Seguimiento[]
}

export const useSeguimientoStore = create<SeguimientoStore>((set, get) => ({
  seguimientos: [],
  config: null,
  periodoActivo: null,
  filtros: defaultFiltros(),
  loading: false,
  error: null,
  setSeguimientos: (seguimientos) => set({ seguimientos }),
  setConfig: (config) => set({ config }),
  setPeriodoActivo: (periodoActivo) => set({ periodoActivo }),
  setFiltro: (key, value) => set((s) => ({ filtros: { ...s.filtros, [key]: value } })),
  resetFiltros: () => set({ filtros: defaultFiltros() }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  addSeguimiento: (s) => set((state) => ({ seguimientos: [s, ...state.seguimientos] })),
  updateSeguimiento: (s) =>
    set((state) => ({
      seguimientos: state.seguimientos.map((x) => (x.id === s.id ? s : x)),
    })),
  removeSeguimiento: (id) =>
    set((state) => ({ seguimientos: state.seguimientos.filter((x) => x.id !== id) })),
  removeSeguimientos: (ids) =>
    set((state) => {
      const setIds = new Set(ids)
      return { seguimientos: state.seguimientos.filter((x) => !setIds.has(x.id)) }
    }),
  listadoVisible: () => {
    const { seguimientos, filtros } = get()
    let list = [...seguimientos].filter((s) => s.activo)

    if (filtros.fechaInicio) {
      list = list.filter((s) => s.fecha >= filtros.fechaInicio)
    }
    if (filtros.fechaFin) {
      list = list.filter((s) => s.fecha <= filtros.fechaFin)
    }
    if (filtros.semanaIso) {
      const w = Number(filtros.semanaIso)
      if (!Number.isNaN(w) && w >= 1 && w <= 53) {
        if (filtros.añoIso) {
          const y = Number(filtros.añoIso)
          if (!Number.isNaN(y)) {
            list = list.filter((s) => {
              const d = dayjs(s.fecha)
              return d.isValid() && d.isoWeek() === w && d.isoWeekYear() === y
            })
          }
        } else {
          list = list.filter((s) => {
            const d = dayjs(s.fecha)
            return d.isValid() && d.isoWeek() === w
          })
        }
      }
    }
    if (filtros.motivoId) list = list.filter((s) => s.motivoContactoId === filtros.motivoId)
    if (filtros.comproId) list = list.filter((s) => s.comproId === filtros.comproId)
    if (filtros.montoMin !== '') {
      const v = Number(filtros.montoMin)
      if (!Number.isNaN(v)) list = list.filter((s) => (s.monto ?? 0) >= v)
    }
    if (filtros.montoMax !== '') {
      const v = Number(filtros.montoMax)
      if (!Number.isNaN(v)) list = list.filter((s) => (s.monto ?? 0) <= v)
    }
    if (filtros.cotizadoMin !== '') {
      const v = Number(filtros.cotizadoMin)
      if (!Number.isNaN(v)) list = list.filter((s) => (s.cotizado ?? 0) >= v)
    }
    if (filtros.cotizadoMax !== '') {
      const v = Number(filtros.cotizadoMax)
      if (!Number.isNaN(v)) list = list.filter((s) => (s.cotizado ?? 0) <= v)
    }
    if (filtros.busquedaLibre.trim()) {
      const q = filtros.busquedaLibre.trim().toLowerCase()
      list = list.filter(
        (s) =>
          s.contacto.toLowerCase().includes(q) ||
          (s.celular || '').includes(q) ||
          s.vendedorNombre.toLowerCase().includes(q) ||
          s.temaNombre.toLowerCase().includes(q) ||
          (s.cotizacionPedido ?? '').toLowerCase().includes(q) ||
          (s.folioFactura || '').toLowerCase().includes(q)
      )
    }

    list.sort((a, b) => b.fecha.localeCompare(a.fecha))
    return list
  },
}))
