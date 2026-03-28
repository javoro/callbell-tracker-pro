import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export interface LicenciaPermisos {
  analytics: boolean
  analytics_export_excel: boolean
  analytics_export_ppt: boolean
  analytics_trend_chart: boolean
  analytics_filters: boolean
}

export interface Licencia {
  clave: string
  nombre: string
  activa: boolean
  permisos: LicenciaPermisos
  vence_en: string | null
}

export type PermisoClave = keyof LicenciaPermisos

export const PERMISOS_DEFAULT: LicenciaPermisos = {
  analytics: false,
  analytics_export_excel: false,
  analytics_export_ppt: false,
  analytics_trend_chart: false,
  analytics_filters: false,
}

export async function validarLicencia(clave: string): Promise<
  | { ok: true; licencia: Licencia }
  | { ok: false; error: string }
> {
  try {
    const { data, error } = await supabase
      .from('licencias')
      .select('clave, nombre, activa, permisos, vence_en')
      .eq('clave', clave.trim().toUpperCase())
      .maybeSingle()

    if (error) return { ok: false, error: 'Error al conectar con el servidor de licencias.' }
    if (!data) return { ok: false, error: 'Clave de licencia no encontrada.' }
    if (!data.activa) return { ok: false, error: 'Esta licencia ha sido desactivada. Contacta al proveedor.' }

    if (data.vence_en) {
      const vence = new Date(data.vence_en)
      if (vence < new Date()) return { ok: false, error: `Esta licencia venció el ${data.vence_en}. Contacta al proveedor.` }
    }

    return {
      ok: true,
      licencia: {
        clave: data.clave,
        nombre: data.nombre,
        activa: data.activa,
        permisos: { ...PERMISOS_DEFAULT, ...data.permisos },
        vence_en: data.vence_en ?? null,
      },
    }
  } catch {
    return { ok: false, error: 'Sin conexión a internet. Verifica tu conexión e intenta de nuevo.' }
  }
}
