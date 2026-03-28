import html2canvas from 'html2canvas'
import type { AnalyticsScreenshotExport } from './analytics-otras-types'

/**
 * Expande temporalmente nodos con scroll u overflow oculto para que html2canvas
 * pinte todo el contenido (tablas anchas, listas largas, etc.).
 */
function expandScrollableDescendants(root: HTMLElement): () => void {
  const all: HTMLElement[] = [
    root,
    ...Array.from(root.querySelectorAll('*')).filter((n): n is HTMLElement => n instanceof HTMLElement),
  ]

  const depth = (el: HTMLElement): number => {
    let d = 0
    let x: HTMLElement | null = el
    while (x && x !== root) {
      d++
      x = x.parentElement
    }
    return d
  }
  all.sort((a, b) => depth(b) - depth(a))

  const restores: Array<() => void> = []

  for (const el of all) {
    const cs = getComputedStyle(el)
    const clipX = el.scrollWidth > el.clientWidth + 1
    const clipY = el.scrollHeight > el.clientHeight + 1
    const ox = cs.overflowX
    const oy = cs.overflowY
    const clipsX = ox === 'auto' || ox === 'scroll' || ox === 'hidden'
    const clipsY = oy === 'auto' || oy === 'scroll' || oy === 'hidden'

    if (clipsX && clipX) {
      const prev = {
        overflowX: el.style.overflowX,
        width: el.style.width,
        maxWidth: el.style.maxWidth,
      }
      el.style.overflowX = 'visible'
      el.style.width = `${el.scrollWidth}px`
      el.style.maxWidth = 'none'
      restores.push(() => {
        el.style.overflowX = prev.overflowX
        el.style.width = prev.width
        el.style.maxWidth = prev.maxWidth
      })
    }
    if (clipsY && clipY) {
      const prev = {
        overflowY: el.style.overflowY,
        height: el.style.height,
        maxHeight: el.style.maxHeight,
      }
      el.style.overflowY = 'visible'
      el.style.height = `${el.scrollHeight}px`
      el.style.maxHeight = 'none'
      restores.push(() => {
        el.style.overflowY = prev.overflowY
        el.style.height = prev.height
        el.style.maxHeight = prev.maxHeight
      })
    }
  }

  void root.offsetHeight

  return () => {
    for (let i = restores.length - 1; i >= 0; i--) restores[i]()
  }
}

function waitNextFrames(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

/**
 * Captura regiones del DOM como PNG (base64 sin prefijo data:) para incrustar en Excel.
 */
export async function captureAnalyticsSnapshots(
  regions: { title: string; element: HTMLElement | null }[]
): Promise<AnalyticsScreenshotExport[]> {
  const results: AnalyticsScreenshotExport[] = []
  for (const { title, element } of regions) {
    if (!element) continue
    const restore = expandScrollableDescendants(element)
    try {
      void element.offsetHeight
      await waitNextFrames()
      const w = element.scrollWidth
      const h = element.scrollHeight
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: w,
        height: h,
        windowWidth: w,
        windowHeight: h,
      })
      const dataUrl = canvas.toDataURL('image/png', 0.92)
      const imageBase64 = dataUrl.replace(/^data:image\/png;base64,/, '')
      results.push({
        title,
        imageBase64,
        width: canvas.width,
        height: canvas.height,
      })
    } catch (err) {
      console.error('[analytics export] Captura fallida:', title, err)
    } finally {
      restore()
    }
  }
  return results
}
