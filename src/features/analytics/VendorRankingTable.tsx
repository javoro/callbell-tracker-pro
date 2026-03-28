import { formatMoney } from '@/lib/utils'
import type { VendorPerformanceRow } from './analytics-otras-types'

interface VendorRankingTableProps {
  rows: VendorPerformanceRow[]
}

export function VendorRankingTable({ rows }: VendorRankingTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-2">Ranking por vendedor</h3>
        <p className="text-sm text-muted-foreground">Sin datos.</p>
      </div>
    )
  }
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="px-4 py-2 border-b border-border bg-muted/50 rounded-t-lg">
        <h3 className="text-sm font-semibold text-foreground">Ranking por vendedor</h3>
      </div>
      <div className="max-h-72 overflow-y-auto overflow-x-visible rounded-b-lg">
        <table className="w-full min-w-max text-sm">
          <thead className="bg-muted/30 sticky top-0">
            <tr>
              <th className="text-left p-2 font-medium">Vendedor</th>
              <th className="text-right p-2 font-medium">Leads</th>
              <th className="text-right p-2 font-medium">Cotiz.</th>
              <th className="text-right p-2 font-medium">Ventas</th>
              <th className="text-right p-2 font-medium">Tasa cierre</th>
              <th className="text-right p-2 font-medium">Monto vendido</th>
              <th className="text-right p-2 font-medium">Monto cotizado</th>
              <th className="text-right p-2 font-medium">Ticket prom.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.vendedor}-${i}`} className="border-t border-border/50 hover:bg-accent/30">
                <td className="p-2 font-medium">{r.vendedor}</td>
                <td className="p-2 text-right">{r.leads}</td>
                <td className="p-2 text-right">{r.cotizaciones}</td>
                <td className="p-2 text-right">{r.ventas}</td>
                <td className="p-2 text-right">{r.tasaCierre.toFixed(1)}%</td>
                <td className="p-2 text-right">{formatMoney(r.montoVendido)}</td>
                <td className="p-2 text-right">{formatMoney(r.montoCotizado)}</td>
                <td className="p-2 text-right">{formatMoney(r.ticketPromedio)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
