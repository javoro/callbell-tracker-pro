import { formatMoney } from '@/lib/utils'
import type { KpiMetrics } from './analytics-otras-types'

interface KpiCardsRowProps {
  metrics: KpiMetrics
}

const cards: { key: keyof KpiMetrics; label: string; format: 'number' | 'money' | 'percent' }[] = [
  { key: 'leadsTotales', label: 'Leads totales', format: 'number' },
  { key: 'cotizaciones', label: 'Cotizaciones', format: 'number' },
  { key: 'ventasCerradas', label: 'Ventas cerradas', format: 'number' },
  { key: 'tasaCierre', label: 'Tasa de cierre', format: 'percent' },
  { key: 'montoVendido', label: 'Monto vendido', format: 'money' },
  { key: 'montoCotizado', label: 'Monto cotizado', format: 'money' },
  { key: 'pipelineAbierto', label: 'Pipeline abierto', format: 'money' },
  { key: 'ticketPromedio', label: 'Ticket promedio', format: 'money' },
]

function formatValue(value: number, format: 'number' | 'money' | 'percent'): string {
  if (format === 'percent') return `${value.toFixed(1)}%`
  if (format === 'money') return formatMoney(value)
  return String(value)
}

export function KpiCardsRow({ metrics }: KpiCardsRowProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(({ key, label, format }) => (
        <div
          key={key}
          className="min-w-0 rounded-lg border border-border bg-card p-3 shadow-sm flex flex-col gap-1"
        >
          <p className="text-xs text-muted-foreground leading-snug break-words">{label}</p>
          <p className="text-lg font-semibold text-foreground tabular-nums leading-tight break-words">
            {formatValue(metrics[key] as number, format)}
          </p>
        </div>
      ))}
    </div>
  )
}
