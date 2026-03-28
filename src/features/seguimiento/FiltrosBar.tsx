import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RotateCcw } from 'lucide-react'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import { useSeguimientoStore } from '@/store/seguimiento-store'
import { useCatalogosStore } from '@/store/catalogos-store'

dayjs.extend(isoWeek)

const SEMANAS_ISO = Array.from({ length: 53 }, (_, i) => i + 1)

function yearOptionsIso(): number[] {
  const y = dayjs().isoWeekYear()
  const from = Math.min(y - 5, y)
  const to = y + 1
  const list: number[] = []
  for (let a = from; a <= to; a++) list.push(a)
  return list
}

const PLACEHOLDER_BUSQUEDA =
  'Contacto, celular, vendedor, tema, cotización o pedido, folio de factura…'

export function FiltrosBar() {
  const { filtros, setFiltro, resetFiltros } = useSeguimientoStore()
  const catalogos = useCatalogosStore((s) => s.catalogos)

  const motivos = catalogos.filter((c) => c.tipoCatalogo === 'motivoContacto' && c.activo)
  const compros = catalogos.filter((c) => c.tipoCatalogo === 'compro' && c.activo)

  const yearOptions = yearOptionsIso()

  return (
    <div className="border-b border-border bg-pastel-morado/50 px-4 py-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div>
          <Label className="text-xs">Fecha desde</Label>
          <Input
            type="date"
            value={filtros.fechaInicio}
            onChange={(e) => setFiltro('fechaInicio', e.target.value)}
            className="h-9"
          />
        </div>
        <div>
          <Label className="text-xs">Fecha hasta</Label>
          <Input
            type="date"
            value={filtros.fechaFin}
            onChange={(e) => setFiltro('fechaFin', e.target.value)}
            className="h-9"
          />
        </div>
        <div>
          <Label className="text-xs">Semana ISO</Label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filtros.semanaIso}
            onChange={(e) => setFiltro('semanaIso', e.target.value)}
          >
            <option value="">Todas</option>
            {SEMANAS_ISO.map((n) => (
              <option key={n} value={String(n)}>
                S{String(n).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs">Año ISO (semana)</Label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filtros.añoIso}
            onChange={(e) => setFiltro('añoIso', e.target.value)}
          >
            <option value="">Todos los años</option>
            {yearOptions.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs">Motivo de compra o no compra</Label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filtros.motivoId}
            onChange={(e) => setFiltro('motivoId', e.target.value)}
          >
            <option value="">Todos</option>
            {motivos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs">Compró</Label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filtros.comproId}
            onChange={(e) => setFiltro('comproId', e.target.value)}
          >
            <option value="">Todos</option>
            {compros.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="flex-1 min-w-0">
          <Label className="text-xs">Búsqueda rápida</Label>
          <Input
            placeholder={PLACEHOLDER_BUSQUEDA}
            value={filtros.busquedaLibre}
            onChange={(e) => setFiltro('busquedaLibre', e.target.value)}
            className="h-9 w-full min-w-0 min-[480px]:min-w-[min(100%,44rem)] text-sm"
            title={PLACEHOLDER_BUSQUEDA}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0 sm:self-end"
          onClick={() => resetFiltros()}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Restablecer filtros
        </Button>
      </div>
    </div>
  )
}
