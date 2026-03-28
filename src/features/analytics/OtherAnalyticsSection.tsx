import { useState, useMemo, forwardRef, useEffect, type RefObject, type MutableRefObject } from 'react'
import type { Seguimiento } from '@/types/seguimiento'
import { getKpiMetrics } from './services/analyticsService'
import { getFunnelMetrics } from './services/funnelMetrics'
import { getTrendMetrics, type TrendGroupBy } from './services/trendMetrics'
import { getVendorRanking } from './services/vendorMetrics'
import { getOpenPipeline } from './services/pipelineMetrics'
import { getDataQualityMetrics, getDataQualityAlerts } from './services/dataQualityMetrics'
import { KpiCardsRow } from './KpiCardsRow'
import { FunnelCard } from './FunnelCard'
import { TrendCard } from './TrendCard'
import { VendorRankingTable } from './VendorRankingTable'
import { OpenPipelineTable } from './OpenPipelineTable'
import { DataQualityCard } from './DataQualityCard'
import type { TrendVistaTendencia } from './TrendCard'

export interface TrendPresentationMeta {
  agrupacion: TrendGroupBy
  vista: TrendVistaTendencia
}

interface OtherAnalyticsSectionProps {
  seguimientos: Seguimiento[]
  kpiCaptureRef?: RefObject<HTMLDivElement | null>
  funnelCaptureRef?: RefObject<HTMLDivElement | null>
  trendCaptureRef?: RefObject<HTMLDivElement | null>
  trendPresentationMetaRef?: MutableRefObject<TrendPresentationMeta | null>
}

export const OtherAnalyticsSection = forwardRef<HTMLElement, OtherAnalyticsSectionProps>(
  function OtherAnalyticsSection(
    { seguimientos, kpiCaptureRef, funnelCaptureRef, trendCaptureRef, trendPresentationMetaRef },
    ref
  ) {
  const [trendGroupBy, setTrendGroupBy] = useState<TrendGroupBy>('semanal')
  const [trendVista, setTrendVista] = useState<TrendVistaTendencia>('barras')

  useEffect(() => {
    if (!trendPresentationMetaRef) return
    trendPresentationMetaRef.current = { agrupacion: trendGroupBy, vista: trendVista }
  }, [trendGroupBy, trendVista, trendPresentationMetaRef])

  const kpi = useMemo(() => getKpiMetrics(seguimientos), [seguimientos])
  const funnel = useMemo(() => getFunnelMetrics(seguimientos), [seguimientos])
  const trendPoints = useMemo(
    () => getTrendMetrics(seguimientos, trendGroupBy),
    [seguimientos, trendGroupBy]
  )
  const vendorRows = useMemo(() => getVendorRanking(seguimientos), [seguimientos])
  const pipelineRows = useMemo(() => getOpenPipeline(seguimientos), [seguimientos])
  const qualityMetrics = useMemo(() => getDataQualityMetrics(seguimientos), [seguimientos])
  const qualityAlerts = useMemo(() => getDataQualityAlerts(seguimientos), [seguimientos])

  return (
    <section ref={ref} className="space-y-6">
      <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">
        Otras
      </h2>

      <div ref={kpiCaptureRef} className="rounded-lg border border-transparent p-1 -m-1">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Resumen ejecutivo adicional</h3>
        <KpiCardsRow metrics={kpi} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div ref={funnelCaptureRef} className="min-w-0">
          <FunnelCard metrics={funnel} />
        </div>
        <div ref={trendCaptureRef} className="min-w-0">
          <TrendCard
            points={trendPoints}
            groupBy={trendGroupBy}
            onGroupByChange={setTrendGroupBy}
            vistaTendencia={trendVista}
            onVistaTendenciaChange={setTrendVista}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <VendorRankingTable rows={vendorRows} />
        <OpenPipelineTable rows={pipelineRows} />
      </div>

      <DataQualityCard metrics={qualityMetrics} alerts={qualityAlerts} />
    </section>
  )
  }
)
