import { formatMoney } from '@/lib/utils'
import type { TrendPoint } from './analytics-otras-types'
import type { TrendGroupBy } from './services/trendMetrics'
import { TrendLineChart } from './TrendLineChart'

export type TrendVistaTendencia = 'barras' | 'lineas'

interface TrendCardProps {
  points: TrendPoint[]
  groupBy: TrendGroupBy
  onGroupByChange: (g: TrendGroupBy) => void
  vistaTendencia: TrendVistaTendencia
  onVistaTendenciaChange: (v: TrendVistaTendencia) => void
}

export function TrendCard({
  points,
  groupBy,
  onGroupByChange,
  vistaTendencia,
  onVistaTendenciaChange,
}: TrendCardProps) {

  const maxLeads = Math.max(1, ...points.map((p) => p.leads))
  const maxVentas = Math.max(1, ...points.map((p) => p.ventas))
  const maxMonto = Math.max(1, ...points.map((p) => p.montoVendido))

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Tendencia por fecha</h3>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => onGroupByChange('diario')}
            className={`px-2 py-1 text-xs rounded ${groupBy === 'diario' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            Diario
          </button>
          <button
            type="button"
            onClick={() => onGroupByChange('semanal')}
            className={`px-2 py-1 text-xs rounded ${groupBy === 'semanal' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            Semanal
          </button>
          <span className="hidden sm:inline w-px h-5 bg-border mx-0.5 shrink-0" aria-hidden />
          {vistaTendencia === 'barras' ? (
            <button
              type="button"
              onClick={() => onVistaTendenciaChange('lineas')}
              className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground hover:bg-muted/80"
            >
              Gráfica de líneas
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onVistaTendenciaChange('barras')}
              className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground hover:bg-muted/80"
            >
              Vista barras
            </button>
          )}
        </div>
      </div>
      {points.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin datos para el periodo.</p>
      ) : vistaTendencia === 'lineas' ? (
        <TrendLineChart points={points} />
      ) : (
        <div className="space-y-3">
          {points.map((p) => (
            <div key={p.fecha} className="text-xs">
              <div className="flex justify-between mb-0.5 gap-2 min-w-0">
                <span className="font-medium text-foreground shrink-0">{p.label}</span>
                <span className="text-muted-foreground text-right break-words">
                  L: {p.leads} · C: {p.cotizaciones} · V: {p.ventas} · {formatMoney(p.montoVendido)}
                </span>
              </div>
              <div className="flex gap-1 h-4">
                <div
                  className="rounded bg-pastel-azul/80 flex-1 min-w-0"
                  style={{ width: `${(p.leads / maxLeads) * 100}%` }}
                  title={`Leads: ${p.leads}`}
                />
                <div
                  className="rounded bg-pastel-morado/80 flex-1 min-w-0"
                  style={{ width: `${(p.cotizaciones / maxLeads) * 100}%` }}
                  title={`Cotizaciones: ${p.cotizaciones}`}
                />
                <div
                  className="rounded bg-green-500/80 flex-1 min-w-0"
                  style={{ width: `${(p.ventas / maxVentas) * 100}%` }}
                  title={`Ventas: ${p.ventas}`}
                />
                <div
                  className="rounded bg-amber-400/80 flex-1 min-w-0"
                  style={{ width: `${(p.montoVendido / maxMonto) * 100}%` }}
                  title={`Monto: ${formatMoney(p.montoVendido)}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
