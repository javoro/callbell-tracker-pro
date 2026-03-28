import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { validarLicencia } from '@/lib/supabase'
import { useLicenseStore } from '@/store/license-store'
import { Loader2, ShieldCheck } from 'lucide-react'

interface ActivacionScreenProps {
  onActivada: () => void
}

export function ActivacionScreen({ onActivada }: ActivacionScreenProps) {
  const [clave, setClave] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const setLicencia = useLicenseStore((s) => s.setLicencia)

  const handleActivar = async () => {
    if (!clave.trim()) {
      setError('Ingresa una clave de licencia.')
      return
    }
    setLoading(true)
    setError(null)
    const result = await validarLicencia(clave)
    if (result.ok) {
      // Guardar la clave localmente para el próximo arranque
      if (window.electronAPI) {
        await window.electronAPI.licenciaGuardar(result.licencia.clave)
      }
      setLicencia(result.licencia)
      onActivada()
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="flex flex-col items-center gap-2 text-center">
          <ShieldCheck className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Callbell Tracker PRO</h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tu clave de licencia para continuar.
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="clave">Clave de licencia</Label>
            <Input
              id="clave"
              placeholder="CTKPRO-XXXX-XXXX-XXXX"
              value={clave}
              onChange={(e) => setClave(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleActivar()}
              autoFocus
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button className="w-full" onClick={handleActivar} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando…
              </>
            ) : (
              'Activar'
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          ¿No tienes una clave? Contacta a tu proveedor.
        </p>
      </div>
    </div>
  )
}
