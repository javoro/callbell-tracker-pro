import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSeguimientoStore } from '@/store/seguimiento-store'
import { getPeriodoActivo } from '@/lib/periodo-corte'
import type { Configuracion } from '@/types/configuracion'

const DEFAULT_CONFIG: Configuracion = {
  tipoCorte: 'semanal',
  fechaInicioPersonalizada: null,
  fechaFinPersonalizada: null,
  diaInicioSemana: 1,
  rutaExportacionPorDefecto: null,
  ultimaFechaUso: null,
  metaSemanal: null,
}

interface ModalConfiguracionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function ModalConfiguracion({ open, onOpenChange, onSaved }: ModalConfiguracionProps) {
  const config = useSeguimientoStore((s) => s.config)
  const setConfig = useSeguimientoStore((s) => s.setConfig)
  const setPeriodoActivo = useSeguimientoStore((s) => s.setPeriodoActivo)
  const [form, setForm] = useState<Configuracion>(DEFAULT_CONFIG)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && config) setForm({ ...DEFAULT_CONFIG, ...config })
  }, [open, config])

  const handleSave = async () => {
    if (!window.electronAPI) return
    setSaving(true)
    try {
      const r = await window.electronAPI.configSave(form)
      if (r.ok) {
        setConfig(form)
        setPeriodoActivo(getPeriodoActivo(form))
        onSaved()
        onOpenChange(false)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configuración de corte</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Tipo de corte</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              value={form.tipoCorte}
              onChange={(e) => setForm({ ...form, tipoCorte: e.target.value as Configuracion['tipoCorte'] })}
            >
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>
          {form.tipoCorte === 'semanal' && (
            <p className="text-sm text-muted-foreground">
              Las semanas van de lunes a domingo y se numeran S01, S02… según el año.
            </p>
          )}
          {form.tipoCorte === 'personalizado' && (
            <>
              <div>
                <Label>Fecha inicio</Label>
                <Input
                  type="date"
                  value={form.fechaInicioPersonalizada ?? ''}
                  onChange={(e) => setForm({ ...form, fechaInicioPersonalizada: e.target.value || null })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Fecha fin</Label>
                <Input
                  type="date"
                  value={form.fechaFinPersonalizada ?? ''}
                  onChange={(e) => setForm({ ...form, fechaFinPersonalizada: e.target.value || null })}
                  className="mt-1"
                />
              </div>
            </>
          )}
          <div>
            <Label>Meta de ventas semanal (opcional, para analíticas)</Label>
            <Input
              type="number"
              min={0}
              step={1000}
              placeholder="Ej. 200000"
              value={form.metaSemanal ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  metaSemanal: e.target.value === '' ? null : Number(e.target.value) || null,
                })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label>Carpeta de exportación por defecto (opcional)</Label>
            <Input
              placeholder="Ruta opcional"
              value={form.rutaExportacionPorDefecto ?? ''}
              onChange={(e) => setForm({ ...form, rutaExportacionPorDefecto: e.target.value || null })}
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
