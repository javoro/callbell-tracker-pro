import type { DataQualityMetrics, DataQualityAlert } from './analytics-otras-types'

interface DataQualityCardProps {
  metrics: DataQualityMetrics
  alerts: DataQualityAlert[]
}

export function DataQualityCard({ metrics, alerts }: DataQualityCardProps) {
  const indicators = [
    { label: '% sin celular', value: metrics.pctSinCelular },
    { label: '% sin vendedor', value: metrics.pctSinVendedor },
    { label: '% sin cotizado', value: metrics.pctSinCotizado },
    { label: '% sin compra', value: metrics.pctSinCompra },
    { label: '% registros completos', value: metrics.pctRegistrosCompletos },
    { label: 'Duplicados por celular', value: metrics.duplicadosPorCelular, format: 'number' as const },
  ]

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
      <div className="px-4 py-2 border-b border-border bg-muted/50">
        <h3 className="text-sm font-semibold text-foreground">Calidad de captura</h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {indicators.map((ind) => (
            <div key={ind.label} className="min-w-0 rounded border border-border/50 p-2 flex flex-col gap-1">
              <p className="text-xs text-muted-foreground leading-snug break-words">{ind.label}</p>
              <p className="text-sm font-semibold text-foreground tabular-nums leading-tight break-words">
                {ind.format === 'number' ? ind.value : `${(ind.value as number).toFixed(1)}%`}
              </p>
            </div>
          ))}
        </div>
        {alerts.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-foreground mb-2">Alertas</h4>
            <ul className="space-y-1 text-sm">
              {alerts.map((a, i) => (
                <li key={i} className="text-muted-foreground">
                  <span className="font-medium text-foreground">{a.mensaje}</span>
                  {' — '}
                  <span>{a.cantidad} registro(s)</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {alerts.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay alertas de calidad.</p>
        )}
      </div>
    </div>
  )
}
