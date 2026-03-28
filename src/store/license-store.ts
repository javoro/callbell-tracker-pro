import { create } from 'zustand'
import type { Licencia, LicenciaPermisos, PermisoClave } from '@/lib/supabase'
import { PERMISOS_DEFAULT } from '@/lib/supabase'

interface LicenseState {
  /** null = aún no verificado, false = sin licencia válida, Licencia = válida */
  licencia: Licencia | null | false
  validando: boolean

  setLicencia: (licencia: Licencia | false) => void
  setValidando: (v: boolean) => void
  hasPermiso: (clave: PermisoClave) => boolean
  permisos: () => LicenciaPermisos
  resetLicencia: () => void
}

export const useLicenseStore = create<LicenseState>((set, get) => ({
  licencia: null,
  validando: false,

  setLicencia: (licencia) => set({ licencia }),
  setValidando: (validando) => set({ validando }),

  hasPermiso: (clave) => {
    const { licencia } = get()
    if (!licencia) return false
    return licencia.permisos[clave] ?? false
  },

  permisos: () => {
    const { licencia } = get()
    if (!licencia) return PERMISOS_DEFAULT
    return licencia.permisos
  },

  resetLicencia: () => set({ licencia: false }),
}))
