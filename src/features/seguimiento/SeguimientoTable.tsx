import { useMemo, useState } from 'react'
import type { Seguimiento } from '@/types/seguimiento'
import { formatMoney } from '@/lib/utils'
import { getSemanaEtiqueta } from '@/lib/analytics'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, ArrowUp, ArrowDown, ArrowUpDown, ListRestart } from 'lucide-react'

type SeguimientoSortKey =
  | 'fecha'
  | 'periodo'
  | 'contacto'
  | 'celular'
  | 'tema'
  | 'motivo'
  | 'compro'
  | 'cotizacion'
  | 'vendedor'
  | 'monto'
  | 'cotizado'
  | 'folio'
  | 'departamento'

function periodoLabel(s: Seguimiento): string {
  return s.periodoEtiqueta ?? getSemanaEtiqueta(s.fecha)
}

function compareSeguimiento(
  a: Seguimiento,
  b: Seguimiento,
  key: SeguimientoSortKey,
  dir: 'asc' | 'desc'
): number {
  const mul = dir === 'asc' ? 1 : -1
  const str = (x: string) => x.trim().toLowerCase()
  switch (key) {
    case 'fecha':
      return mul * a.fecha.localeCompare(b.fecha)
    case 'periodo':
      return mul * periodoLabel(a).localeCompare(periodoLabel(b), 'es', { numeric: true })
    case 'contacto':
      return mul * str(a.contacto).localeCompare(str(b.contacto), 'es', { sensitivity: 'base' })
    case 'celular':
      return mul * str(a.celular || '').localeCompare(str(b.celular || ''), 'es', { numeric: true })
    case 'tema':
      return mul * str(a.temaNombre).localeCompare(str(b.temaNombre), 'es', { sensitivity: 'base' })
    case 'motivo':
      return mul * str(a.motivoContactoNombre).localeCompare(str(b.motivoContactoNombre), 'es', {
        sensitivity: 'base',
      })
    case 'compro':
      return mul * str(a.comproNombre).localeCompare(str(b.comproNombre), 'es', { sensitivity: 'base' })
    case 'cotizacion':
      return mul * str(a.cotizacionPedido ?? '').localeCompare(str(b.cotizacionPedido ?? ''), 'es', {
        sensitivity: 'base',
      })
    case 'vendedor':
      return mul * str(a.vendedorNombre).localeCompare(str(b.vendedorNombre), 'es', { sensitivity: 'base' })
    case 'monto':
      return mul * ((a.monto ?? 0) - (b.monto ?? 0))
    case 'cotizado':
      return mul * ((a.cotizado ?? 0) - (b.cotizado ?? 0))
    case 'folio':
      return mul * str(a.folioFactura || '').localeCompare(str(b.folioFactura || ''), 'es', {
        numeric: true,
        sensitivity: 'base',
      })
    case 'departamento':
      return mul * str(a.departamentoNombre).localeCompare(str(b.departamentoNombre), 'es', {
        sensitivity: 'base',
      })
    default:
      return 0
  }
}

interface SeguimientoTableProps {
  listado: Seguimiento[]
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onSelectAll: (checked: boolean) => void
  onEdit: (seguimiento: Seguimiento) => void
  onDelete: (seguimiento: Seguimiento) => void
}

function SortableTh({
  label,
  colKey,
  effectiveKey,
  effectiveDir,
  onSort,
  align = 'left',
}: {
  label: string
  colKey: SeguimientoSortKey
  effectiveKey: SeguimientoSortKey
  effectiveDir: 'asc' | 'desc'
  onSort: (k: SeguimientoSortKey) => void
  align?: 'left' | 'right'
}) {
  const active = effectiveKey === colKey
  return (
    <th className={`p-2 font-medium ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button
        type="button"
        onClick={() => onSort(colKey)}
        className={`inline-flex items-center gap-1 rounded px-1 py-0.5 -mx-1 hover:bg-accent/60 w-full ${
          align === 'right' ? 'justify-end' : 'justify-start'
        }`}
        title={`Ordenar por ${label}`}
      >
        <span>{label}</span>
        {active ? (
          effectiveDir === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-25" aria-hidden />
        )}
      </button>
    </th>
  )
}

export function SeguimientoTable({
  listado,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onEdit,
  onDelete,
}: SeguimientoTableProps) {
  const [sortKey, setSortKey] = useState<SeguimientoSortKey | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const effectiveKey: SeguimientoSortKey = sortKey ?? 'fecha'
  const effectiveDir: 'asc' | 'desc' = sortKey === null ? 'desc' : sortDir

  const sortedList = useMemo(() => {
    const arr = [...listado]
    arr.sort((a, b) => compareSeguimiento(a, b, effectiveKey, effectiveDir))
    return arr
  }, [listado, effectiveKey, effectiveDir])

  const isDefaultOrder = sortKey === null

  function handleSortClick(key: SeguimientoSortKey) {
    if (sortKey === null && key === 'fecha') {
      setSortKey('fecha')
      setSortDir('asc')
      return
    }
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      if (key === 'fecha' || key === 'monto' || key === 'cotizado') setSortDir('desc')
      else setSortDir('asc')
    }
  }

  function resetOrden() {
    setSortKey(null)
    setSortDir('desc')
  }

  if (listado.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No hay registros para mostrar. Use los filtros o agregue un seguimiento.
      </div>
    )
  }

  const allSelected = sortedList.length > 0 && sortedList.every((s) => selectedIds.includes(s.id))
  const someSelected = selectedIds.length > 0

  return (
    <div className="rounded-lg border border-border overflow-hidden shadow-sm bg-card">
      <div className="flex flex-wrap items-center justify-end gap-2 px-3 py-2 border-b border-border bg-muted/40">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={resetOrden}
          disabled={isDefaultOrder}
          title="Volver al orden por fecha (más reciente primero)"
        >
          <ListRestart className="h-3.5 w-3.5 mr-1" />
          Restablecer orden
        </Button>
      </div>
      <div className="overflow-auto max-h-[calc(100vh-320px)]">
        <table className="w-full text-sm">
          <thead className="bg-pastel-rosa/70 sticky top-0 z-10 text-foreground">
            <tr>
              <th className="w-10 p-2 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                  title={allSelected ? 'Desmarcar todos' : 'Seleccionar todos'}
                />
              </th>
              <SortableTh
                label="Fecha"
                colKey="fecha"
                effectiveKey={effectiveKey}
                effectiveDir={effectiveDir}
                onSort={handleSortClick}
              />
              <SortableTh
                label="Periodo"
                colKey="periodo"
                effectiveKey={effectiveKey}
                effectiveDir={effectiveDir}
                onSort={handleSortClick}
              />
              <SortableTh
                label="Contacto"
                colKey="contacto"
                effectiveKey={effectiveKey}
                effectiveDir={effectiveDir}
                onSort={handleSortClick}
              />
              <SortableTh
                label="Celular"
                colKey="celular"
                effectiveKey={effectiveKey}
                effectiveDir={effectiveDir}
                onSort={handleSortClick}
              />
              <SortableTh
                label="Tema"
                colKey="tema"
                effectiveKey={effectiveKey}
                effectiveDir={effectiveDir}
                onSort={handleSortClick}
              />
              <SortableTh
                label="Motivo de compra o no compra"
                colKey="motivo"
                effectiveKey={effectiveKey}
                effectiveDir={effectiveDir}
                onSort={handleSortClick}
              />
              <SortableTh
                label="Compró"
                colKey="compro"
                effectiveKey={effectiveKey}
                effectiveDir={effectiveDir}
                onSort={handleSortClick}
              />
              <SortableTh
                label="Cotización/pedido"
                colKey="cotizacion"
                effectiveKey={effectiveKey}
                effectiveDir={effectiveDir}
                onSort={handleSortClick}
              />
              <SortableTh
                label="Vendedor"
                colKey="vendedor"
                effectiveKey={effectiveKey}
                effectiveDir={effectiveDir}
                onSort={handleSortClick}
              />
              <SortableTh
                label="Monto"
                colKey="monto"
                effectiveKey={effectiveKey}
                effectiveDir={effectiveDir}
                onSort={handleSortClick}
                align="right"
              />
              <SortableTh
                label="Cotizado"
                colKey="cotizado"
                effectiveKey={effectiveKey}
                effectiveDir={effectiveDir}
                onSort={handleSortClick}
                align="right"
              />
              <SortableTh
                label="Folio factura"
                colKey="folio"
                effectiveKey={effectiveKey}
                effectiveDir={effectiveDir}
                onSort={handleSortClick}
              />
              <SortableTh
                label="Departamento"
                colKey="departamento"
                effectiveKey={effectiveKey}
                effectiveDir={effectiveDir}
                onSort={handleSortClick}
              />
              <th className="w-24 p-2 text-center font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedList.map((s) => (
              <tr key={s.id} className="border-t border-border/50 hover:bg-accent/50 transition-colors">
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s.id)}
                    onChange={() => onToggleSelect(s.id)}
                    className="h-4 w-4 rounded border-border"
                    title="Seleccionar"
                  />
                </td>
                <td className="p-2 whitespace-nowrap">{s.fecha}</td>
                <td className="p-2 font-medium">{periodoLabel(s)}</td>
                <td className="p-2">{s.contacto}</td>
                <td className="p-2">{s.celular}</td>
                <td className="p-2">{s.temaNombre}</td>
                <td className="p-2">{s.motivoContactoNombre}</td>
                <td className="p-2">{s.comproNombre}</td>
                <td className="p-2">{s.cotizacionPedido}</td>
                <td className="p-2">{s.vendedorNombre}</td>
                <td className="p-2 text-right">{formatMoney(s.monto)}</td>
                <td className="p-2 text-right">{formatMoney(s.cotizado)}</td>
                <td className="p-2">{s.folioFactura}</td>
                <td className="p-2">{s.departamentoNombre}</td>
                <td className="p-2">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => onEdit(s)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(s)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
