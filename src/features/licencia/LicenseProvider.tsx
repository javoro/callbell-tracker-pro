import { useEffect, useState } from 'react'
import { validarLicencia } from '@/lib/supabase'
import { useLicenseStore } from '@/store/license-store'
import { ActivacionScreen } from './ActivacionScreen'
import { Loader2 } from 'lucide-react'

const DEV_LICENSE = {
  clave: 'DEV',
  nombre: 'Desarrollo',
  activa: true,
  vence_en: null,
  permisos: {
    analytics: true,
    analytics_export_excel: true,
    analytics_export_ppt: true,
    analytics_trend_chart: true,
    analytics_filters: true,
  },
} as const

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const { setLicencia, setValidando, licencia } = useLicenseStore()
  const [verificada, setVerificada] = useState(false)

  useEffect(() => {
    async function verificar() {
      if (!window.electronAPI) {
        // Entorno de desarrollo: licencia completa automática
        setLicencia(DEV_LICENSE)
        setVerificada(true)
        return
      }
      setValidando(true)
      const r = await window.electronAPI.licenciaLeer()
      if (r.ok && r.clave) {
        const result = await validarLicencia(r.clave)
        if (result.ok) {
          setLicencia(result.licencia)
        } else {
          // La clave guardada ya no es válida (revocada, vencida…)
          await window.electronAPI.licenciaEliminar()
          setLicencia(false)
        }
      } else {
        setLicencia(false)
      }
      setValidando(false)
      setVerificada(true)
    }
    verificar()
  }, [setLicencia, setValidando])

  if (!verificada) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Verificando licencia…</span>
        </div>
      </div>
    )
  }

  if (licencia === false) {
    return (
      <ActivacionScreen
        onActivada={() => {
          // El store ya tiene la licencia, solo re-trigger
          setVerificada(true)
        }}
      />
    )
  }

  return <>{children}</>
}
