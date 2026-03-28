import type { PermisoClave } from '@/lib/supabase'
import { useLicenseStore } from '@/store/license-store'
import { Lock } from 'lucide-react'

interface FeatureGateProps {
  permiso: PermisoClave
  children: React.ReactNode
  /** Mensaje personalizado. Por defecto muestra un candado genérico. */
  mensaje?: string
  /** Si true, oculta completamente el elemento en lugar de mostrar el candado */
  ocultar?: boolean
}

export function FeatureGate({ permiso, children, mensaje, ocultar = false }: FeatureGateProps) {
  const hasPermiso = useLicenseStore((s) => s.hasPermiso)

  if (hasPermiso(permiso)) return <>{children}</>

  if (ocultar) return null

  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-muted-foreground">
      <Lock className="h-6 w-6 opacity-50" />
      <p className="text-sm">{mensaje ?? 'Esta función no está incluida en tu licencia.'}</p>
    </div>
  )
}
