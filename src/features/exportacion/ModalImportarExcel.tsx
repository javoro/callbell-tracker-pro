import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSeguimientoStore } from '@/store/seguimiento-store'
import { useCatalogosStore } from '@/store/catalogos-store'
import { getSemanaEtiqueta } from '@/lib/analytics'
import { FileUp, Loader2 } from 'lucide-react'
import dayjs from 'dayjs'

interface ModalImportarExcelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportDone: () => void
}

const OPCIONES_SEMANA = Array.from({ length: 53 }, (_, i) => `S${String(i + 1).padStart(2, '0')}`)

export function ModalImportarExcel({ open, onOpenChange, onImportDone }: ModalImportarExcelProps) {
  const [filePath, setFilePath] = useState('')
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(() =>
    getSemanaEtiqueta(dayjs().format('YYYY-MM-DD'))
  )
  const [importing, setImporting] = useState(false)
  useEffect(() => {
    if (open) setPeriodoSeleccionado(getSemanaEtiqueta(dayjs().format('YYYY-MM-DD')))
  }, [open])
  const [result, setResult] = useState<{
    imported: number
    skipped: number
    catalogosAdded: number
    errors: string[]
  } | null>(null)

  const setSeguimientos = useSeguimientoStore((s) => s.setSeguimientos)
  const setCatalogos = useCatalogosStore((s) => s.setCatalogos)

  const handleSelectFile = async () => {
    if (!window.electronAPI) return
    const r = await window.electronAPI.dialogShowOpenDialog({ filters: [{ name: 'Excel', extensions: ['xlsx'] }] })
    if (!r.canceled && r.filePaths?.[0]) {
      setFilePath(r.filePaths[0])
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!window.electronAPI || !filePath.trim() || !periodoSeleccionado) {
      alert('Seleccione un archivo y la semana (periodo) al que se cargará la importación.')
      return
    }
    setImporting(true)
    setResult(null)
    try {
      const r = await window.electronAPI.importExcel({
        filePath,
        periodoSeleccionado,
      })
      setResult({
        imported: r.imported ?? 0,
        skipped: r.skipped ?? 0,
        catalogosAdded: r.catalogosAdded ?? 0,
        errors: r.errors ?? [],
      })
      if (r.ok) {
        if ((r.imported ?? 0) > 0) {
          const [resS, resC] = await Promise.all([
            window.electronAPI.seguimientosGet(),
            window.electronAPI.catalogosGet(),
          ])
          if (resS.ok && resS.data) setSeguimientos(resS.data)
          if (resC.ok && resC.data) setCatalogos(resC.data)
          onImportDone()
          alert(`Importación completada correctamente.\n\nSe importaron ${r.imported} registro(s).`)
        } else {
          alert('Importación finalizada.\n\nNo se importó ningún registro (todas las filas sin fecha válida o sin contacto/celular).')
        }
      } else if (r.errors?.length) {
        alert('No se pudo importar el archivo.\n\n' + (r.errors[0] ?? 'Revise el formato del archivo.'))
      }
    } catch (e) {
      setResult({ imported: 0, skipped: 0, catalogosAdded: 0, errors: [String(e)] })
      alert('Error al importar: ' + String(e))
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setFilePath('')
    setPeriodoSeleccionado(getSemanaEtiqueta(dayjs().format('YYYY-MM-DD')))
    setResult(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); else onOpenChange(o) }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Excel</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          El archivo debe tener el mismo formato que la exportación (mismos encabezados en el mismo orden).
          Seleccione la semana (periodo) al que pertenecerán los registros importados.
        </p>
        <div className="space-y-4 py-2">
          <div>
            <Label>Archivo .xlsx</Label>
            <div className="flex gap-2 mt-1">
              <Input readOnly value={filePath} placeholder="Ningún archivo seleccionado" className="flex-1" />
              <Button type="button" variant="outline" onClick={handleSelectFile} disabled={importing}>
                Seleccionar
              </Button>
            </div>
          </div>
          <div>
            <Label>Periodo (semana) al que se cargará la importación *</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              value={periodoSeleccionado}
              onChange={(e) => setPeriodoSeleccionado(e.target.value)}
            >
              {OPCIONES_SEMANA.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {result && (
            <div className="rounded-md border border-border bg-card p-3 text-sm space-y-1">
              <p className="font-medium text-foreground">
                {result.imported} registro(s) importados.
              </p>
              {result.skipped > 0 && (
                <p className="text-muted-foreground">{result.skipped} fila(s) omitidas (fuera de periodo o inválidas).</p>
              )}
              {result.catalogosAdded > 0 && (
                <p className="text-muted-foreground">
                  {result.catalogosAdded} elemento(s) agregados a catálogos (valores que no existían).
                </p>
              )}
              {result.errors.length > 0 && (
                <div className="pt-2">
                  <p className="font-medium text-destructive">Advertencias/errores:</p>
                  <ul className="list-disc list-inside text-destructive text-xs">
                    {result.errors.slice(0, 10).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                    {result.errors.length > 10 && (
                      <li>... y {result.errors.length - 10} más</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cerrar
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={importing || !filePath || !periodoSeleccionado}
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <FileUp className="h-4 w-4" />
                Importar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
