import { formatMoney } from '@/lib/utils'
import type { PipelineRow, SemaphoreStatus } from './analytics-otras-types'

interface OpenPipelineTableProps {
  rows: PipelineRow[]
}

function SemaforoDot({ status }: { status: SemaphoreStatus }) {
  const color =
    status === 'verde' ? 'bg-green-500' : status === 'amarillo' ? 'bg-amber-500' : 'bg-red-500'
  return (
    <span
      className={`inline-block w-3 h-3 rounded-full ${color}`}
      title={status === 'verde' ? '0-2 días' : status === 'amarillo' ? '3-7 días' : '8+ días'}
    />
  )
}

export function OpenPipelineTable({ rows }: OpenPipelineTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-2">Pipeline abierto</h3>
        <p className="text-sm text-muted-foreground">No hay cotizaciones abiertas.</p>
      </div>
    )
  }
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="px-4 py-2 border-b border-border bg-muted/50 rounded-t-lg">
        <h3 className="text-sm font-semibold text-foreground">Pipeline abierto</h3>
      </div>
      <div className="max-h-72 overflow-y-auto overflow-x-visible rounded-b-lg">
        <table className="w-full min-w-max text-sm">
          <thead className="bg-muted/30 sticky top-0">
            <tr>
              <th className="text-left p-2 font-medium">Contacto</th>
              <th className="text-left p-2 font-medium">Fecha</th>
              <th className="text-left p-2 font-medium">Celular</th>
              <th className="text-left p-2 font-medium">Vendedor</th>
              <th className="text-right p-2 font-medium">Cotizado</th>
              <th className="text-right p-2 font-medium">Días abierta</th>
              <th className="text-center p-2 font-medium">Semáforo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border/50 hover:bg-accent/30">
                <td className="p-2">{r.contacto}</td>
                <td className="p-2 whitespace-nowrap">{r.fecha}</td>
                <td className="p-2">{r.celular}</td>
                <td className="p-2">{r.vendedor}</td>
                <td className="p-2 text-right">{formatMoney(r.cotizado)}</td>
                <td className="p-2 text-right">{r.diasAbierta}</td>
                <td className="p-2 text-center">
                  <SemaforoDot status={r.semaforo} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
