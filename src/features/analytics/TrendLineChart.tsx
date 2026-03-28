import { formatMoney } from '@/lib/utils'
import type { TrendPoint } from './analytics-otras-types'

const STROKE = {
  leads: 'hsl(210 55% 42%)',
  cotizaciones: 'hsl(262 48% 48%)',
  ventas: 'hsl(142 55% 38%)',
  monto: 'hsl(32 90% 48%)',
} as const

interface TrendLineChartProps {
  points: TrendPoint[]
}

/**
 * Gráfica de líneas 2D: tres series en escala de conteos y monto en escala propia.
 */
export function TrendLineChart({ points }: TrendLineChartProps) {
  const n = points.length
  const padL = 44
  const padR = 52
  const padT = 16
  const padB = 56
  const vbW = 520
  const vbH = 220
  const innerW = vbW - padL - padR
  const innerH = vbH - padT - padB

  const maxCount = Math.max(
    1,
    ...points.map((p) => Math.max(p.leads, p.cotizaciones, p.ventas))
  )
  const maxMonto = Math.max(1, ...points.map((p) => p.montoVendido))

  const xAt = (i: number) =>
    n <= 1 ? padL + innerW / 2 : padL + (i / (n - 1)) * innerW

  const yCount = (v: number) => padT + innerH * (1 - v / maxCount)
  const yMonto = (v: number) => padT + innerH * (1 - v / maxMonto)

  const linePath = (getY: (p: TrendPoint) => number): string => {
    if (n === 0) return ''
    if (n === 1) {
      const x = xAt(0)
      const y = getY(points[0])
      return `M ${x} ${y}`
    }
    return points
      .map((p, i) => {
        const x = xAt(i)
        const y = getY(p)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }

  const labelStep = Math.max(1, Math.ceil(n / 7))
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: padT + innerH * (1 - t),
    label: Math.round(maxCount * t),
  }))

  return (
    <div className="w-full">
      <svg
        className="w-full h-auto text-muted-foreground"
        viewBox={`0 0 ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Tendencia: leads, cotizaciones, ventas y monto vendido"
      >
        <title>Tendencia por fecha en gráfica de líneas</title>

        {gridLines.map(({ y, label }) => (
          <g key={y}>
            <line
              x1={padL}
              y1={y}
              x2={padL + innerW}
              y2={y}
              className="stroke-border"
              strokeWidth={0.75}
            />
            <text x={padL - 6} y={y + 4} textAnchor="end" className="fill-muted-foreground text-[9px]">
              {label}
            </text>
          </g>
        ))}

        <line
          x1={padL + innerW}
          y1={padT}
          x2={padL + innerW}
          y2={padT + innerH}
          className="stroke-border"
          strokeWidth={0.75}
        />
        <text
          x={padL + innerW + 6}
          y={padT + 10}
          className="fill-muted-foreground text-[8px]"
        >
          {formatMoney(maxMonto)}
        </text>
        <text
          x={padL + innerW + 6}
          y={padT + innerH}
          className="fill-muted-foreground text-[8px]"
        >
          $0
        </text>

        <path
          d={linePath((p) => yCount(p.leads))}
          fill="none"
          stroke={STROKE.leads}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={linePath((p) => yCount(p.cotizaciones))}
          fill="none"
          stroke={STROKE.cotizaciones}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={linePath((p) => yCount(p.ventas))}
          fill="none"
          stroke={STROKE.ventas}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={linePath((p) => yMonto(p.montoVendido))}
          fill="none"
          stroke={STROKE.monto}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 3"
        />

        {n === 1 && (
          <>
            <circle cx={xAt(0)} cy={yCount(points[0].leads)} r={3.5} fill={STROKE.leads} />
            <circle cx={xAt(0)} cy={yCount(points[0].cotizaciones)} r={3.5} fill={STROKE.cotizaciones} />
            <circle cx={xAt(0)} cy={yCount(points[0].ventas)} r={3.5} fill={STROKE.ventas} />
            <circle cx={xAt(0)} cy={yMonto(points[0].montoVendido)} r={3.5} fill={STROKE.monto} />
          </>
        )}

        {points.map((p, i) =>
          i % labelStep === 0 || i === n - 1 ? (
            <text
              key={p.fecha}
              x={xAt(i)}
              y={vbH - padB + 28}
              textAnchor="middle"
              className="fill-muted-foreground text-[8px]"
            >
              <title>{p.label}</title>
              {p.label.length > 12 ? `${p.label.slice(0, 10)}…` : p.label}
            </text>
          ) : null
        )}
      </svg>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 justify-center text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded-full" style={{ background: STROKE.leads }} />
          Leads
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded-full" style={{ background: STROKE.cotizaciones }} />
          Cotizaciones
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded-full" style={{ background: STROKE.ventas }} />
          Ventas
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width={18} height={8} aria-hidden className="shrink-0">
            <line
              x1={0}
              y1={4}
              x2={18}
              y2={4}
              stroke={STROKE.monto}
              strokeWidth={2}
              strokeDasharray="4 3"
            />
          </svg>
          Monto (escala derecha)
        </span>
      </div>
      <p className="mt-1 text-center text-[10px] text-muted-foreground">
        Eje izquierdo: conteos (máx. {maxCount}). Eje derecho: monto vendido.
      </p>
    </div>
  )
}
