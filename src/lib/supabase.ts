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

export async function validarLicencia(clave: string, machineId: string): Promise<
  | { ok: true; licencia: Licencia }
  | { ok: false; error: string }
> {
  try {
    const { data, error } = await supabase
      .rpc('activar_licencia', {
        p_clave: clave.trim().toUpperCase(),
        p_machine_id: machineId,
      })

    if (error) return { ok: false, error: 'Error al conectar con el servidor de licencias.' }

    const result = data as {
      ok: boolean
      error?: string
      clave?: string
      nombre?: string
      activa?: boolean
      permisos?: LicenciaPermisos
      vence_en?: string | null
    }

    if (!result.ok) return { ok: false, error: result.error ?? 'Error desconocido.' }

    return {
      ok: true,
      licencia: {
        clave: result.clave!,
        nombre: result.nombre!,
        activa: result.activa!,
        permisos: { ...PERMISOS_DEFAULT, ...result.permisos },
        vence_en: result.vence_en ?? null,
      },
    }
  } catch {
    return { ok: false, error: 'Sin conexión a internet. Verifica tu conexión e intenta de nuevo.' }
  }
}
