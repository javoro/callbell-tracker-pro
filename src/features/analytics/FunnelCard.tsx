import type { FunnelMetrics } from './analytics-otras-types'

interface FunnelCardProps {
  metrics: FunnelMetrics
}

export function FunnelCard({ metrics }: FunnelCardProps) {
  const max = Math.max(
    metrics.leads,
    metrics.cotizaciones,
    metrics.ventas,
    metrics.cotizacionesAbiertas,
    1
  )
  const width = (n: number) => (max > 0 ? (n / max) * 100 : 0)

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Funnel comercial</h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Leads</span>
            <span className="font-medium">{metrics.leads}</span>
          </div>
          <div className="h-6 rounded bg-muted overflow-hidden">
            <div
              className="h-full bg-pastel-azul rounded"
              style={{ width: `${width(metrics.leads)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Cotizaciones</span>
            <span className="font-medium">{metrics.cotizaciones}</span>
          </div>
          <div className="h-6 rounded bg-muted overflow-hidden">
            <div
              className="h-full bg-pastel-morado rounded"
              style={{ width: `${width(metrics.cotizaciones)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Ventas</span>
            <span className="font-medium">{metrics.ventas}</span>
          </div>
          <div className="h-6 rounded bg-muted overflow-hidden">
            <div
              className="h-full bg-green-500 rounded"
              style={{ width: `${width(metrics.ventas)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Cotizaciones abiertas</span>
            <span className="font-medium">{metrics.cotizacionesAbiertas}</span>
          </div>
          <div className="h-6 rounded bg-muted overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded"
              style={{ width: `${width(metrics.cotizacionesAbiertas)}%` }}
            />
          </div>
        </div>
      </div>
      <div className="pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <p className="text-muted-foreground">
          Lead → Cotización: <span className="font-medium text-foreground">{metrics.conversionLeadCotizacion.toFixed(1)}%</span>
        </p>
        <p className="text-muted-foreground">
          Cotización → Venta: <span className="font-medium text-foreground">{metrics.conversionCotizacionVenta.toFixed(1)}%</span>
        </p>
        <p className="text-muted-foreground">
          Lead → Venta: <span className="font-medium text-foreground">{metrics.conversionLeadVenta.toFixed(1)}%</span>
        </p>
      </div>
    </div>
  )
}
