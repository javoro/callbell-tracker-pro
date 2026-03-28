import PptxGenJS from 'pptxgenjs'
import type { AnalyticsExportPayload } from './persistencia'

const ACCENT = '2E7D32'
const HEADER_FILL = '2E7D32'
const SECTION_FILL = 'E8F5E9'
const BORDER = 'BDBDBD'

function fmtMoney(n: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}

function fmtPct(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)} %`
}

function formatDelta(n: number): string {
  if (n === 0) return ''
  return n > 0 ? ` (+${n})` : ` (${n})`
}

function semaforoLabel(s: string): string {
  if (s === 'verde') return 'Verde'
  if (s === 'amarillo') return 'Amarillo'
  if (s === 'rojo') return 'Rojo'
  return s
}

type PptxTableRow = { text: string; options?: PptxGenJS.TableCellProps }[][]

function headerRow(labels: [string, string]): PptxTableRow[number] {
  return [
    {
      text: labels[0],
      options: {
        bold: true,
        fill: { color: HEADER_FILL },
        color: 'FFFFFF',
        fontSize: 10,
      },
    },
    {
      text: labels[1],
      options: {
        bold: true,
        fill: { color: HEADER_FILL },
        color: 'FFFFFF',
        fontSize: 10,
      },
    },
  ]
}

function sectionTitleRow(title: string): PptxTableRow[number] {
  return [
    {
      text: title,
      options: {
        colspan: 2,
        bold: true,
        fill: { color: SECTION_FILL },
        color: '363636',
        fontSize: 10,
      },
    },
  ]
}

function dataRow(label: string, value: string): PptxTableRow[number] {
  return [
    { text: label, options: { fontSize: 9, color: '424242' } },
    { text: value, options: { fontSize: 9, color: '212121' } },
  ]
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

type ChartCapture = { imageBase64: string; width: number; height: number }

/** Diapositiva con barra de acento, título, subtítulo opcional e imagen centrada. */
function addSlideWithChartImage(
  pptx: PptxGenJS,
  title: string,
  subtitle: string | undefined,
  shot: ChartCapture
): void {
  const slide = pptx.addSlide()
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.32,
    fill: { color: ACCENT },
    line: { type: 'none' },
  })
  slide.addText(title, {
    x: 0.45,
    y: 0.42,
    w: 9,
    h: 0.4,
    fontSize: 22,
    bold: true,
    color: '212121',
  })
  let imageTopY = 1.05
  let maxH = 4.85
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.45,
      y: 0.86,
      w: 9,
      h: 0.4,
      fontSize: 11,
      color: '616161',
      italic: true,
    })
    imageTopY = 1.22
    maxH = 4.68
  }
  const maxW = 9.2
  const ratio = shot.width / Math.max(shot.height, 1)
  let iw = maxW
  let ih = iw / ratio
  if (ih > maxH) {
    ih = maxH
    iw = ih * ratio
  }
  const ix = (10 - iw) / 2
  slide.addImage({
    data: `image/png;base64,${shot.imageBase64}`,
    x: ix,
    y: imageTopY,
    w: iw,
    h: ih,
  })
}

const tableOpts = (y: number, h = 4.9): PptxGenJS.TableProps => ({
  x: 0.45,
  y,
  w: 9.1,
  colW: [5.4, 3.7],
  fontSize: 9,
  border: { type: 'solid', color: BORDER, pt: 0.5 },
  autoPage: true,
  autoPageRepeatHeader: true,
  autoPageHeaderRows: 1,
  autoPageSlideStartY: 0.55,
})

export async function exportAnalyticsToPowerPoint(
  data: AnalyticsExportPayload,
  filePath: string
): Promise<void> {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_16x9'
  pptx.author = 'Callbell Tracker PRO'
  pptx.company = 'Callbell Tracker PRO'
  pptx.title = 'Analíticas'
  pptx.subject = 'Reporte de analíticas'

  const fechaGen = new Date().toLocaleString('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  // —— Portada ——
  const s0 = pptx.addSlide()
  s0.background = { color: 'FAFAFA' }
  s0.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.45,
    fill: { color: ACCENT },
    line: { type: 'none' },
  })
  s0.addText('Analíticas', {
    x: 0.6,
    y: 1.35,
    w: 8.8,
    h: 0.9,
    fontSize: 40,
    bold: true,
    color: '212121',
    fontFace: 'Calibri',
  })
  s0.addText('Callbell Tracker PRO', {
    x: 0.6,
    y: 2.25,
    w: 8.8,
    h: 0.45,
    fontSize: 20,
    color: '424242',
    fontFace: 'Calibri',
  })
  s0.addText(`Generado: ${fechaGen}`, {
    x: 0.6,
    y: 3.05,
    w: 8.8,
    h: 0.35,
    fontSize: 12,
    color: '616161',
  })
  s0.addText(
    'Resumen comercial, funnel, tendencia, ranking, pipeline y calidad de captura — periodo según filtros en la aplicación.',
    {
      x: 0.6,
      y: 3.55,
      w: 8.2,
      h: 1.2,
      fontSize: 12,
      color: '616161',
      valign: 'top',
    }
  )

  const { semanaActual, semanaAnterior, deltas, metaSemanal, porcentajeMeta } = data.relevantes
  const kpi = data.kpi

  const relevantesTableRows: PptxTableRow = [
    headerRow(['Indicador', 'Valor']),
    sectionTitleRow('Relevantes (comparativa en pantalla)'),
    dataRow(
      `Leads totales ${semanaActual.etiqueta}`,
      `${semanaActual.leadsTotales}${semanaAnterior ? formatDelta(deltas.leads) : ''}`
    ),
    dataRow(
      'Cotizaciones',
      `${semanaActual.cotizaciones}${semanaAnterior ? formatDelta(deltas.cotizaciones) : ''}`
    ),
    dataRow('Cotizaciones en seguimiento', String(semanaActual.cotizacionesEnSeguimiento)),
    dataRow(
      'Cotizaciones concretadas en venta',
      `${semanaActual.concretadasEnVenta}${semanaAnterior ? formatDelta(deltas.concretadas) : ''}`
    ),
  ]
  if (semanaAnterior) {
    relevantesTableRows.push(
      dataRow(`Ventas (${semanaAnterior.etiqueta})`, fmtMoney(semanaAnterior.ventas)),
      dataRow(`Ticket promedio (${semanaAnterior.etiqueta})`, fmtMoney(semanaAnterior.ticketPromedio))
    )
  }
  relevantesTableRows.push(
    dataRow(`Ventas (${semanaActual.etiqueta})`, fmtMoney(semanaActual.ventas)),
    dataRow(`Ticket promedio (${semanaActual.etiqueta})`, fmtMoney(semanaActual.ticketPromedio))
  )
  if (porcentajeMeta != null) {
    relevantesTableRows.push(dataRow('% de la meta semanal', fmtPct(porcentajeMeta, 2)))
  }
  if (metaSemanal != null) {
    relevantesTableRows.push(dataRow('Meta semanal configurada', fmtMoney(metaSemanal)))
  }

  const kpiTableRows: PptxTableRow = [
    headerRow(['Indicador', 'Valor']),
    sectionTitleRow('Métricas del periodo filtrado (KPI)'),
    dataRow('Leads totales', String(kpi.leadsTotales)),
    dataRow('Cotizaciones', String(kpi.cotizaciones)),
    dataRow('Ventas cerradas', String(kpi.ventasCerradas)),
    dataRow('Tasa de cierre', fmtPct(kpi.tasaCierre)),
    dataRow('Monto vendido', fmtMoney(kpi.montoVendido)),
    dataRow('Monto cotizado', fmtMoney(kpi.montoCotizado)),
    dataRow('Pipeline abierto', fmtMoney(kpi.pipelineAbierto)),
    dataRow('Ticket promedio', fmtMoney(kpi.ticketPromedio)),
  ]

  // —— Diapositiva 2: Relevantes (captura pantalla = dos columnas como en la app) ——
  if (data.relevantesScreenshot) {
    addSlideWithChartImage(pptx, 'Relevantes', undefined, data.relevantesScreenshot)
  } else {
    const sRel = pptx.addSlide()
    sRel.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 0.32,
      fill: { color: ACCENT },
      line: { type: 'none' },
    })
    sRel.addText('Relevantes', {
      x: 0.45,
      y: 0.42,
      w: 9,
      h: 0.4,
      fontSize: 22,
      bold: true,
      color: '212121',
    })
    sRel.addTable(relevantesTableRows as PptxGenJS.TableRow[], tableOpts(0.95, 4.5))
  }

  // —— Diapositiva 3: Resumen ejecutivo adicional — 8 tarjetas KPI como en pantalla ——
  if (data.kpiCardsScreenshot) {
    addSlideWithChartImage(pptx, 'Resumen ejecutivo adicional', undefined, data.kpiCardsScreenshot)
  } else {
    const sKpi = pptx.addSlide()
    sKpi.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 0.32,
      fill: { color: ACCENT },
      line: { type: 'none' },
    })
    sKpi.addText('Resumen ejecutivo adicional', {
      x: 0.45,
      y: 0.42,
      w: 9,
      h: 0.4,
      fontSize: 22,
      bold: true,
      color: '212121',
    })
    sKpi.addTable(kpiTableRows as PptxGenJS.TableRow[], { ...tableOpts(0.95, 4.5), autoPage: false })
  }

  // —— Funnel comercial (captura de pantalla o tabla de respaldo) ——
  const f = data.funnel
  if (data.funnelScreenshot) {
    addSlideWithChartImage(pptx, 'Funnel comercial', undefined, data.funnelScreenshot)
  } else {
    const funnelRows: PptxTableRow = [
      headerRow(['Concepto', 'Valor']),
      dataRow('Leads', String(f.leads)),
      dataRow('Cotizaciones', String(f.cotizaciones)),
      dataRow('Ventas', String(f.ventas)),
      dataRow('Cotizaciones abiertas', String(f.cotizacionesAbiertas)),
      sectionTitleRow('Tasas de conversión'),
      dataRow('Lead → Cotización', fmtPct(f.conversionLeadCotizacion)),
      dataRow('Cotización → Venta', fmtPct(f.conversionCotizacionVenta)),
      dataRow('Lead → Venta', fmtPct(f.conversionLeadVenta)),
    ]
    const s2 = pptx.addSlide()
    s2.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 0.32,
      fill: { color: ACCENT },
      line: { type: 'none' },
    })
    s2.addText('Funnel comercial', {
      x: 0.45,
      y: 0.42,
      w: 9,
      h: 0.4,
      fontSize: 22,
      bold: true,
      color: '212121',
    })
    s2.addTable(funnelRows as PptxGenJS.TableRow[], {
      ...tableOpts(0.95),
      h: 4.2,
      autoPage: false,
    })
  }

  // —— Tendencia ——
  const trendHeader: PptxTableRow[number][] = [
    [
      { text: 'Periodo', options: { bold: true, fill: { color: HEADER_FILL }, color: 'FFFFFF', fontSize: 9 } },
      { text: 'Leads', options: { bold: true, fill: { color: HEADER_FILL }, color: 'FFFFFF', fontSize: 9 } },
      { text: 'Cotiz.', options: { bold: true, fill: { color: HEADER_FILL }, color: 'FFFFFF', fontSize: 9 } },
      { text: 'Ventas', options: { bold: true, fill: { color: HEADER_FILL }, color: 'FFFFFF', fontSize: 9 } },
      { text: 'Monto vendido', options: { bold: true, fill: { color: HEADER_FILL }, color: 'FFFFFF', fontSize: 9 } },
    ],
  ]
  const trendOpts: PptxGenJS.TableProps = {
    x: 0.45,
    y: 0.95,
    w: 9.1,
    colW: [2.2, 1.35, 1.35, 1.35, 2.85],
    fontSize: 8,
    border: { type: 'solid', color: BORDER, pt: 0.5 },
    autoPage: false,
  }

  if (data.trend.length === 0) {
    const st = pptx.addSlide()
    st.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 0.32,
      fill: { color: ACCENT },
      line: { type: 'none' },
    })
    st.addText('Tendencia por fecha', { x: 0.45, y: 0.42, w: 9, h: 0.4, fontSize: 22, bold: true })
    st.addText('Sin datos de tendencia para el periodo.', { x: 0.45, y: 1.2, w: 8, h: 0.5, fontSize: 12 })
  } else if (data.trendScreenshot) {
    addSlideWithChartImage(pptx, 'Tendencia por fecha', undefined, data.trendScreenshot)
  } else {
    for (let i = 0; i < data.trend.length; i += 18) {
      const part = data.trend.slice(i, i + 18)
      const rows: PptxTableRow = [
        ...trendHeader,
        ...part.map((p) => [
          { text: p.label, options: { fontSize: 8 } },
          { text: String(p.leads), options: { fontSize: 8 } },
          { text: String(p.cotizaciones), options: { fontSize: 8 } },
          { text: String(p.ventas), options: { fontSize: 8 } },
          { text: fmtMoney(p.montoVendido), options: { fontSize: 8 } },
        ]),
      ]
      const st = pptx.addSlide()
      st.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 10,
        h: 0.32,
        fill: { color: ACCENT },
        line: { type: 'none' },
      })
      st.addText(i === 0 ? 'Tendencia por fecha' : 'Tendencia por fecha (continuación)', {
        x: 0.45,
        y: 0.42,
        w: 9,
        h: 0.4,
        fontSize: 22,
        bold: true,
      })
      st.addTable(rows as PptxGenJS.TableRow[], trendOpts)
    }
  }

  // —— Ranking vendedores ——
  const vendHeader: PptxTableRow[number][] = [
    [
      { text: 'Vendedor', options: { bold: true, fill: { color: HEADER_FILL }, color: 'FFFFFF', fontSize: 8 } },
      { text: 'Leads', options: { bold: true, fill: { color: HEADER_FILL }, color: 'FFFFFF', fontSize: 8 } },
      { text: 'Cotiz.', options: { bold: true, fill: { color: HEADER_FILL }, color: 'FFFFFF', fontSize: 8 } },
      { text: 'Ventas', options: { bold: true, fill: { color: HEADER_FILL }, color: 'FFFFFF', fontSize: 8 } },
      { text: '% Cierre', options: { bold: true, fill: { color: HEADER_FILL }, color: 'FFFFFF', fontSize: 8 } },
      { text: 'Monto vendido', options: { bold: true, fill: { color: HEADER_FILL }, color: 'FFFFFF', fontSize: 8 } },
      { text: 'Ticket prom.', options: { bold: true, fill: { color: HEADER_FILL }, color: 'FFFFFF', fontSize: 8 } },
    ],
  ]
  const vendOpts: PptxGenJS.TableProps = {
    x: 0.35,
    y: 0.95,
    w: 9.3,
    colW: [2.1, 0.85, 0.85, 0.85, 0.95, 1.85, 1.85],
    fontSize: 7,
    border: { type: 'solid', color: BORDER, pt: 0.5 },
    autoPage: false,
  }

  if (data.vendor.length === 0) {
    const sv = pptx.addSlide()
    sv.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 0.32,
      fill: { color: ACCENT },
      line: { type: 'none' },
    })
    sv.addText('Ranking por vendedor', { x: 0.45, y: 0.42, w: 9, h: 0.4, fontSize: 22, bold: true })
    sv.addText('Sin datos de vendedores.', { x: 0.45, y: 1.2, w: 8, h: 0.5, fontSize: 12 })
  } else {
    let vendIdx = 0
    for (const part of chunk(data.vendor, 12)) {
      const rows: PptxTableRow = [
        ...vendHeader,
        ...part.map((v) => [
          { text: v.vendedor, options: { fontSize: 7 } },
          { text: String(v.leads), options: { fontSize: 7 } },
          { text: String(v.cotizaciones), options: { fontSize: 7 } },
          { text: String(v.ventas), options: { fontSize: 7 } },
          { text: fmtPct(v.tasaCierre), options: { fontSize: 7 } },
          { text: fmtMoney(v.montoVendido), options: { fontSize: 7 } },
          { text: fmtMoney(v.ticketPromedio), options: { fontSize: 7 } },
        ]),
      ]
      const sv = pptx.addSlide()
      sv.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 10,
        h: 0.32,
        fill: { color: ACCENT },
        line: { type: 'none' },
      })
      sv.addText(vendIdx === 0 ? 'Ranking por vendedor' : 'Ranking por vendedor (continuación)', {
        x: 0.45,
        y: 0.42,
        w: 9,
        h: 0.4,
        fontSize: 22,
        bold: true,
      })
      sv.addTable(rows as PptxGenJS.TableRow[], vendOpts)
      vendIdx++
    }
  }

  // —— Pipeline ——
  const pipeHeader: PptxTableRow[number][] = [
    [
      { text: 'Contacto', options: { bold: true, fill: { color: HEADER_FILL }, color: 'FFFFFF', fontSize: 8 } },
      { text: 'Fecha', options: { bold: true, fill: { color: HEADER_FILL }, color: 'FFFFFF', fontSize: 8 } },
      { text: 'Vendedor', options: { bold: true, fill: { color: HEADER_FILL }, color: 'FFFFFF', fontSize: 8 } },
      { text: 'Cotizado', options: { bold: true, fill: { color: HEADER_FILL }, color: 'FFFFFF', fontSize: 8 } },
      { text: 'Días', options: { bold: true, fill: { color: HEADER_FILL }, color: 'FFFFFF', fontSize: 8 } },
      { text: 'Semáforo', options: { bold: true, fill: { color: HEADER_FILL }, color: 'FFFFFF', fontSize: 8 } },
    ],
  ]
  const pipeOpts: PptxGenJS.TableProps = {
    x: 0.35,
    y: 0.95,
    w: 9.3,
    colW: [2.4, 1.1, 1.8, 1.5, 0.65, 1.85],
    fontSize: 7,
    border: { type: 'solid', color: BORDER, pt: 0.5 },
    autoPage: false,
  }

  if (data.pipeline.length === 0) {
    const sp = pptx.addSlide()
    sp.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 0.32,
      fill: { color: ACCENT },
      line: { type: 'none' },
    })
    sp.addText('Pipeline abierto', { x: 0.45, y: 0.42, w: 9, h: 0.4, fontSize: 22, bold: true })
    sp.addText('No hay cotizaciones abiertas en el periodo.', { x: 0.45, y: 1.2, w: 8, h: 0.5, fontSize: 12 })
  } else {
    let pipeIdx = 0
    for (const part of chunk(data.pipeline, 10)) {
      const rows: PptxTableRow = [
        ...pipeHeader,
        ...part.map((p) => [
          { text: p.contacto, options: { fontSize: 7 } },
          { text: p.fecha, options: { fontSize: 7 } },
          { text: p.vendedor, options: { fontSize: 7 } },
          { text: fmtMoney(p.cotizado), options: { fontSize: 7 } },
          { text: String(p.diasAbierta), options: { fontSize: 7 } },
          { text: semaforoLabel(p.semaforo), options: { fontSize: 7 } },
        ]),
      ]
      const sp = pptx.addSlide()
      sp.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 10,
        h: 0.32,
        fill: { color: ACCENT },
        line: { type: 'none' },
      })
      sp.addText(pipeIdx === 0 ? 'Pipeline abierto' : 'Pipeline abierto (continuación)', {
        x: 0.45,
        y: 0.42,
        w: 9,
        h: 0.4,
        fontSize: 22,
        bold: true,
      })
      sp.addTable(rows as PptxGenJS.TableRow[], pipeOpts)
      pipeIdx++
    }
  }

  // —— Calidad de captura ——
  const q = data.quality.metrics
  const qualityRows: PptxTableRow = [
    headerRow(['Indicador', 'Valor']),
    dataRow('% sin celular', fmtPct(q.pctSinCelular)),
    dataRow('% sin vendedor', fmtPct(q.pctSinVendedor)),
    dataRow('% sin cotizado', fmtPct(q.pctSinCotizado)),
    dataRow('% sin compra', fmtPct(q.pctSinCompra)),
    dataRow('% registros completos', fmtPct(q.pctRegistrosCompletos)),
    dataRow('Duplicados por celular', String(q.duplicadosPorCelular)),
  ]
  const sq = pptx.addSlide()
  sq.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.32,
    fill: { color: ACCENT },
    line: { type: 'none' },
  })
  sq.addText('Calidad de captura', {
    x: 0.45,
    y: 0.42,
    w: 9,
    h: 0.4,
    fontSize: 22,
    bold: true,
  })
  sq.addTable(qualityRows as PptxGenJS.TableRow[], {
    ...tableOpts(0.95),
    colW: [5.4, 3.7],
    w: 9.1,
    autoPage: false,
  })

  const alertLines =
    data.quality.alerts.length === 0
      ? 'No hay alertas de calidad.'
      : data.quality.alerts.map((a) => `• ${a.mensaje} — ${a.cantidad} registro(s)`).join('\n')

  sq.addText('Alertas', {
    x: 0.45,
    y: 3.55,
    w: 2,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: '424242',
  })
  sq.addText(alertLines, {
    x: 0.45,
    y: 3.9,
    w: 9,
    h: 1.5,
    fontSize: 10,
    color: '424242',
    valign: 'top',
    lineSpacingMultiple: 1.15,
  })

  await pptx.writeFile({ fileName: filePath, compression: true })
}
