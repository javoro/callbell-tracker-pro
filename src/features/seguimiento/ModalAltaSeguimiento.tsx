import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { seguimientoFormSchema, type SeguimientoFormValues } from './schema-seguimiento'
import { useSeguimientoStore } from '@/store/seguimiento-store'
import { useCatalogosStore } from '@/store/catalogos-store'
import { getSemanaEtiqueta } from '@/lib/analytics'
import type { Seguimiento } from '@/types/seguimiento'
import { useState, useEffect } from 'react'

interface ModalAltaSeguimientoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  /** Si se pasa, el modal abre en modo edición */
  seguimientoToEdit?: Seguimiento | null
}

function findNombre(catalogos: { id: string; nombre: string }[], id: string | null): string {
  if (!id) return ''
  const c = catalogos.find((x) => x.id === id)
  return c?.nombre ?? ''
}

export function ModalAltaSeguimiento({ open, onOpenChange, onSaved, seguimientoToEdit }: ModalAltaSeguimientoProps) {
  const catalogos = useCatalogosStore((s) => s.catalogos)
  const addSeguimiento = useSeguimientoStore((s) => s.addSeguimiento)
  const updateSeguimiento = useSeguimientoStore((s) => s.updateSeguimiento)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEdit = Boolean(seguimientoToEdit?.id)

  const temas = catalogos.filter((c) => c.tipoCatalogo === 'tema' && c.activo)
  const motivos = catalogos.filter((c) => c.tipoCatalogo === 'motivoContacto' && c.activo)
  const compros = catalogos.filter((c) => c.tipoCatalogo === 'compro' && c.activo)
  const vendedores = catalogos.filter((c) => c.tipoCatalogo === 'vendedor' && c.activo)
  const departamentos = catalogos.filter((c) => c.tipoCatalogo === 'departamento' && c.activo)

  const form = useForm<SeguimientoFormValues>({
    resolver: zodResolver(seguimientoFormSchema),
    defaultValues: getDefaultValues(null),
  })

  function getDefaultValues(seg: Seguimiento | null | undefined): SeguimientoFormValues {
    if (!seg) {
      return {
        contacto: '',
        celular: '',
        fecha: dayjs().format('YYYY-MM-DD'),
        temaId: '',
        motivoContactoId: '',
        comproId: '',
        cotizacionPedido: '',
        vendedorId: '',
        monto: null,
        cotizado: null,
        folioFactura: '',
        departamentoId: '',
      }
    }
    return {
      contacto: seg.contacto,
      celular: seg.celular,
      fecha: seg.fecha,
      temaId: seg.temaId ?? '',
      motivoContactoId: seg.motivoContactoId ?? '',
      comproId: seg.comproId ?? '',
      cotizacionPedido: seg.cotizacionPedido ?? '',
      vendedorId: seg.vendedorId ?? '',
      monto: seg.monto ?? null,
      cotizado: seg.cotizado ?? null,
      folioFactura: seg.folioFactura ?? '',
      departamentoId: seg.departamentoId ?? '',
    }
  }

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(seguimientoToEdit ?? null))
      setError(null)
    }
  }, [open, seguimientoToEdit])

  const onSubmit = async (values: SeguimientoFormValues) => {
    if (!window.electronAPI) return
    setSaving(true)
    setError(null)
    try {
      const now = dayjs().toISOString()
      const seg: Seguimiento = {
        id: isEdit ? seguimientoToEdit!.id : uuidv4(),
        contacto: values.contacto,
        celular: values.celular,
        fecha: values.fecha,
        periodoEtiqueta: getSemanaEtiqueta(values.fecha),
        temaId: values.temaId || null,
        temaNombre: findNombre(temas, values.temaId),
        motivoContactoId: values.motivoContactoId || null,
        motivoContactoNombre: findNombre(motivos, values.motivoContactoId),
        comproId: values.comproId || null,
        comproNombre: findNombre(compros, values.comproId),
        cotizacionPedido: values.cotizacionPedido || '',
        vendedorId: values.vendedorId || null,
        vendedorNombre: findNombre(vendedores, values.vendedorId),
        monto: values.monto != null && values.monto !== '' ? Number(values.monto) : null,
        cotizado: values.cotizado != null && values.cotizado !== '' ? Number(values.cotizado) : null,
        folioFactura: values.folioFactura ?? '',
        departamentoId: values.departamentoId || null,
        departamentoNombre: findNombre(departamentos, values.departamentoId),
        createdAt: isEdit ? seguimientoToEdit!.createdAt : now,
        updatedAt: now,
        activo: isEdit ? seguimientoToEdit!.activo : true,
      }
      if (isEdit) {
        const result = await window.electronAPI.seguimientoUpdate(seg)
        if (result.ok) {
          updateSeguimiento(seg)
          form.reset(getDefaultValues(null))
          onSaved()
          onOpenChange(false)
        } else {
          setError(result.error ?? 'Error al actualizar')
        }
      } else {
        const result = await window.electronAPI.seguimientoSave(seg)
        if (result.ok) {
          addSeguimiento(seg)
          form.reset(getDefaultValues(null))
          onSaved()
          onOpenChange(false)
        } else {
          setError(result.error ?? 'Error al guardar')
        }
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar seguimiento' : 'Agregar seguimiento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Contacto *</Label>
              <Input {...form.register('contacto')} className="mt-1" />
              {form.formState.errors.contacto && (
                <p className="text-xs text-destructive">{form.formState.errors.contacto.message}</p>
              )}
            </div>
            <div>
              <Label>Celular *</Label>
              <Input {...form.register('celular')} type="text" className="mt-1" />
              {form.formState.errors.celular && (
                <p className="text-xs text-destructive">{form.formState.errors.celular.message}</p>
              )}
            </div>
            <div>
              <Label>Fecha *</Label>
              <Input {...form.register('fecha')} type="date" className="mt-1" />
              {form.formState.errors.fecha && (
                <p className="text-xs text-destructive">{form.formState.errors.fecha.message}</p>
              )}
            </div>
            <div>
              <Label>Tema *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                {...form.register('temaId')}
              >
                <option value="">Seleccione</option>
                {temas.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
              {form.formState.errors.temaId && (
                <p className="text-xs text-destructive">{form.formState.errors.temaId.message}</p>
              )}
            </div>
            <div>
              <Label>Motivo de compra o no compra *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                {...form.register('motivoContactoId')}
              >
                <option value="">Seleccione</option>
                {motivos.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
              {form.formState.errors.motivoContactoId && (
                <p className="text-xs text-destructive">{form.formState.errors.motivoContactoId.message}</p>
              )}
            </div>
            <div>
              <Label>Compró</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                {...form.register('comproId')}
              >
                <option value="">Seleccione</option>
                {compros.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Cotización o pedido</Label>
              <Input
                {...form.register('cotizacionPedido')}
                className="mt-1"
                placeholder="Ej: Cotización #123 / Pedido #456"
              />
            </div>
            <div>
              <Label>Vendedor *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                {...form.register('vendedorId')}
              >
                <option value="">Seleccione</option>
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>{v.nombre}</option>
                ))}
              </select>
              {form.formState.errors.vendedorId && (
                <p className="text-xs text-destructive">{form.formState.errors.vendedorId.message}</p>
              )}
            </div>
            <div>
              <Label>Monto</Label>
              <Input
                {...form.register('monto')}
                type="number"
                step="0.01"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Cotizado</Label>
              <Input
                {...form.register('cotizado')}
                type="number"
                step="0.01"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Folio factura</Label>
              <Input {...form.register('folioFactura')} className="mt-1" />
            </div>
            <div>
              <Label>Departamento *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                {...form.register('departamentoId')}
              >
                <option value="">Seleccione</option>
                {departamentos.map((d) => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </select>
              {form.formState.errors.departamentoId && (
                <p className="text-xs text-destructive">{form.formState.errors.departamentoId.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (isEdit ? 'Guardando cambios...' : 'Guardando...') : isEdit ? 'Guardar cambios' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
