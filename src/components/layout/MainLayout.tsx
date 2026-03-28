import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useSeguimientoStore } from '@/store/seguimiento-store'
import { useCatalogosStore } from '@/store/catalogos-store'
import { SeguimientoTable } from '@/features/seguimiento/SeguimientoTable'
import { FiltrosBar } from '@/features/seguimiento/FiltrosBar'
import { ModalAltaSeguimiento } from '@/features/seguimiento/ModalAltaSeguimiento'
import { ModalCatalogos } from '@/features/catalogos/ModalCatalogos'
import { ModalConfiguracion } from '@/features/configuracion/ModalConfiguracion'
import { ModalAcercaDe } from '@/features/configuracion/ModalAcercaDe'
import { exportarExcel } from '@/features/exportacion/exportarExcel'
import { ModalImportarExcel } from '@/features/exportacion/ModalImportarExcel'
import { SeccionAnalytics } from '@/features/analytics/SeccionAnalytics'
import type { Seguimiento } from '@/types/seguimiento'
import type { FullAnalyticsExportPayload } from '@/features/analytics/analytics-otras-types'
import { Loader2, Plus, FileSpreadsheet, FileDown, FolderOpen, Settings, Info, Trash2, BarChart3, List } from 'lucide-react'
import dayjs from 'dayjs'

export function MainLayout() {
  const {
    config,
    periodoActivo,
    loading,
    error,
    setSeguimientos,
    setConfig,
    setPeriodoActivo,
    setLoading,
    setError,
    listadoVisible,
  } = useSeguimientoStore()
  const [modalAlta, setModalAlta] = useState(false)
  const [modalCatalogos, setModalCatalogos] = useState(false)
  const [modalConfig, setModalConfig] = useState(false)
  const [modalAcercaDe, setModalAcercaDe] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [editingSeguimiento, setEditingSeguimiento] = useState<Seguimiento | null>(null)
  const [modalImportar, setModalImportar] = useState(false)
  const [vista, setVista] = useState<'seguimiento' | 'analiticas'>('seguimiento')

  const setCatalogos = useCatalogosStore((s) => s.setCatalogos)
  const removeSeguimiento = useSeguimientoStore((s) => s.removeSeguimiento)
  const removeSeguimientos = useSeguimientoStore((s) => s.removeSeguimientos)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!window.electronAPI) return
      setLoading(true)
      setError(null)
      try {
        const [rS, rC, rCat] = await Promise.all([
          window.electronAPI.seguimientosGet(),
          window.electronAPI.configGet(),
          window.electronAPI.catalogosGet(),
        ])
        if (cancelled) return
        if (rS.ok && rS.data) setSeguimientos(rS.data)
        if (rC.ok && rC.data) {
          setConfig(rC.data)
          const { getPeriodoActivo } = await import('@/lib/periodo-corte')
          setPeriodoActivo(getPeriodoActivo(rC.data))
        }
        if (rCat.ok && rCat.data) setCatalogos(rCat.data)
      } catch (e) {
        if (!cancelled) setError(String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [setSeguimientos, setConfig, setPeriodoActivo, setLoading, setError, setCatalogos])

  const visible = listadoVisible()

  const handleEditSeguimiento = (s: Seguimiento) => {
    setEditingSeguimiento(s)
    setModalAlta(true)
  }

  const handleDeleteSeguimiento = async (s: Seguimiento) => {
    if (!window.electronAPI) return
    if (!confirm(`¿Eliminar el seguimiento de "${s.contacto}" del ${s.fecha}? Esta acción no se puede deshacer.`)) return
    const r = await window.electronAPI.seguimientoDelete(s.id)
    if (r.ok) removeSeguimiento(s.id)
    else alert(r.error ?? 'Error al eliminar')
  }

  const handleDeleteSelected = async () => {
    if (!window.electronAPI || selectedIds.length === 0) return
    if (
      !confirm(
        `¿Eliminar ${selectedIds.length} seguimiento(s) seleccionado(s)? Esta acción no se puede deshacer.`
      )
    )
      return
    const r = await window.electronAPI.seguimientoDeleteMultiple(selectedIds)
    if (r.ok) {
      removeSeguimientos(selectedIds)
      setSelectedIds([])
    } else alert(r.error ?? 'Error al eliminar')
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportarExcel(visible)
    } finally {
      setExporting(false)
    }
  }

  const enAnaliticas = vista === 'analiticas'

  const handleExportAnalytics = async (data: FullAnalyticsExportPayload) => {
    if (!window.electronAPI) {
      alert('No está disponible la exportación.')
      return
    }
    const defaultName = `analiticas_${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`
    const result = await window.electronAPI.dialogShowSaveDialog({
      defaultPath: defaultName,
      filters: [{ name: 'Excel', extensions: ['xlsx'] }],
    })
    if (result.canceled || !result.filePath) return
    const r = await window.electronAPI.exportAnalyticsExcel({ data, filePath: result.filePath })
    if (r.ok) alert('Exportación completada correctamente.')
    else alert('Error al exportar: ' + (r.error ?? 'Error desconocido'))
  }

  const handleExportAnalyticsPowerPoint = async (data: FullAnalyticsExportPayload) => {
    if (!window.electronAPI) {
      alert('No está disponible la exportación.')
      return
    }
    const defaultName = `analiticas_${dayjs().format('YYYY-MM-DD_HH-mm')}.pptx`
    const result = await window.electronAPI.dialogShowSaveDialog({
      defaultPath: defaultName,
      filters: [{ name: 'PowerPoint', extensions: ['pptx'] }],
    })
    if (result.canceled || !result.filePath) return
    const r = await window.electronAPI.exportAnalyticsPowerPoint({ data, filePath: result.filePath })
    if (r.ok) alert('Presentación creada correctamente.')
    else alert('Error al crear la presentación: ' + (r.error ?? 'Error desconocido'))
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-end shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant={vista === 'seguimiento' ? 'default' : 'outline'}
            onClick={() => setVista('seguimiento')}
          >
            <List className="h-4 w-4" />
            Seguimientos
          </Button>
          <Button
            size="sm"
            variant={vista === 'analiticas' ? 'default' : 'outline'}
            onClick={() => setVista('analiticas')}
            disabled={enAnaliticas}
            title={enAnaliticas ? 'Ya está en Analíticas' : undefined}
          >
            <BarChart3 className="h-4 w-4" />
            Analíticas
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setVista('seguimiento')
              setModalAlta(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Agregar seguimiento
          </Button>
          <Button size="sm" variant="outline" onClick={handleExport} disabled={exporting || vista !== 'seguimiento'}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
            Exportar Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setModalImportar(true)}
            disabled={enAnaliticas}
            title={enAnaliticas ? 'Disponible desde la vista Seguimientos' : undefined}
          >
            <FileDown className="h-4 w-4" />
            Importar Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setModalCatalogos(true)}
            disabled={enAnaliticas}
            title={enAnaliticas ? 'Disponible desde la vista Seguimientos' : undefined}
          >
            <FolderOpen className="h-4 w-4" />
            Catálogos
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setModalConfig(true)}
            disabled={enAnaliticas}
            title={enAnaliticas ? 'Disponible desde la vista Seguimientos' : undefined}
          >
            <Settings className="h-4 w-4" />
            Configuración
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setModalAcercaDe(true)} title="Acerca de">
            <Info className="h-4 w-4" />
            Acerca de
          </Button>
        </div>
      </header>

      {periodoActivo && vista === 'seguimiento' && (
        <div className="px-4 py-2 bg-pastel-azul/80 text-sm text-foreground border-b border-border/60">
          Periodo activo: {periodoActivo.inicio} — {periodoActivo.fin}
          {periodoActivo.etiqueta
            ? ` (${periodoActivo.etiqueta})`
            : config?.tipoCorte && ` (corte ${config.tipoCorte})`}
        </div>
      )}

      {vista === 'seguimiento' && <FiltrosBar />}

      <main className="flex-1 overflow-auto px-4 pb-4">
        {error && (
          <div className="py-2 text-destructive text-sm">
            {error}
          </div>
        )}
        {vista === 'analiticas' && (
          <SeccionAnalytics
            onExportExcel={handleExportAnalytics}
            onExportPowerPoint={handleExportAnalyticsPowerPoint}
          />
        )}
        {vista === 'seguimiento' && (
          <>
            {selectedIds.length > 0 && !loading && (
              <div className="mb-2 flex items-center gap-2">
                <Button size="sm" variant="destructive" onClick={handleDeleteSelected}>
                  <Trash2 className="h-4 w-4" />
                  Eliminar seleccionados ({selectedIds.length})
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
                  Desmarcar
                </Button>
              </div>
            )}
            {loading ? (
              <div className="flex items-center gap-2 py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                Cargando...
              </div>
            ) : (
              <SeguimientoTable
                listado={visible}
                selectedIds={selectedIds}
                onToggleSelect={(id) =>
                  setSelectedIds((prev) =>
                    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                  )
                }
                onSelectAll={(checked) =>
                  setSelectedIds(checked ? visible.map((s) => s.id) : [])
                }
                onEdit={handleEditSeguimiento}
                onDelete={handleDeleteSeguimiento}
              />
            )}
          </>
        )}
      </main>

      <ModalAltaSeguimiento
        open={modalAlta}
        onOpenChange={(open) => {
          setModalAlta(open)
          if (!open) setEditingSeguimiento(null)
        }}
        onSaved={() => { setModalAlta(false); setEditingSeguimiento(null) }}
        seguimientoToEdit={editingSeguimiento}
      />
      <ModalCatalogos open={modalCatalogos} onOpenChange={setModalCatalogos} />
      <ModalConfiguracion open={modalConfig} onOpenChange={setModalConfig} onSaved={() => setModalConfig(false)} />
      <ModalAcercaDe open={modalAcercaDe} onOpenChange={setModalAcercaDe} />
      <ModalImportarExcel
        open={modalImportar}
        onOpenChange={setModalImportar}
        onImportDone={() => setModalImportar(false)}
      />
    </div>
  )
}
