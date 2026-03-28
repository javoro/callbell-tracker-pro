import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCatalogosStore } from '@/store/catalogos-store'
import type { TipoCatalogo } from '@/types/catalogo'
import type { CatalogoItem } from '@/types/catalogo'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import { Plus, Pencil, Eye, EyeOff, Trash2 } from 'lucide-react'

const TIPOS: { value: TipoCatalogo; label: string }[] = [
  { value: 'tema', label: 'Tema' },
  { value: 'motivoContacto', label: 'Motivo de compra o no compra' },
  { value: 'compro', label: 'Compró' },
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'departamento', label: 'Departamento' },
]

interface ModalCatalogosProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalCatalogos({ open, onOpenChange }: ModalCatalogosProps) {
  const { catalogos, setCatalogos } = useCatalogosStore()
  const [tipo, setTipo] = useState<TipoCatalogo>('tema')
  const [verInactivos, setVerInactivos] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadCatalogos = async () => {
    if (!window.electronAPI) return
    setLoading(true)
    try {
      const r = await window.electronAPI.catalogosGet()
      if (r.ok && r.data) setCatalogos(r.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) loadCatalogos()
  }, [open])

  const items = catalogos.filter((c) => c.tipoCatalogo === tipo && (verInactivos || c.activo))
  const maxOrden = Math.max(0, ...catalogos.filter((c) => c.tipoCatalogo === tipo).map((c) => c.orden))

  const handleAgregar = async () => {
    const nombre = nuevoNombre.trim()
    if (!nombre || !window.electronAPI) return
    const now = dayjs().toISOString()
    const item: CatalogoItem = {
      id: uuidv4(),
      tipoCatalogo: tipo,
      nombre,
      activo: true,
      orden: maxOrden + 1,
      createdAt: now,
      updatedAt: now,
    }
    const r = await window.electronAPI.catalogoSave(item)
    if (r.ok) {
      setCatalogos([...catalogos, item])
      setNuevoNombre('')
    }
  }

  const handleUpdate = async (id: string, updates: { nombre?: string; activo?: boolean }) => {
    if (!window.electronAPI) return
    if (updates.nombre !== undefined && !updates.nombre.trim()) {
      setEditError('El nombre no puede estar vacío')
      return
    }
    setEditError(null)
    const now = dayjs().toISOString()
    const r = await window.electronAPI.catalogoUpdate({ id, ...updates, updatedAt: now })
    if (r.ok) {
      setCatalogos(
        catalogos.map((c) =>
          c.id === id ? { ...c, ...updates, updatedAt: now } : c
        )
      )
      setEditId(null)
      setEditNombre('')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.electronAPI || !confirm('¿Eliminar este elemento del catálogo? Esta acción no se puede deshacer.')) return
    setDeletingId(id)
    try {
      const r = await window.electronAPI.catalogoDelete(id)
      if (r.ok) {
        setCatalogos(catalogos.filter((c) => c.id !== id))
        if (editId === id) {
          setEditId(null)
          setEditNombre('')
          setEditError(null)
        }
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Catálogos</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 flex-wrap">
          {TIPOS.map((t) => (
            <Button
              key={t.value}
              size="sm"
              variant={tipo === t.value ? 'default' : 'outline'}
              onClick={() => setTipo(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Nuevo nombre"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAgregar()}
            className="flex-1 min-w-0"
            autoComplete="off"
            />
          <Button size="sm" onClick={handleAgregar} disabled={!nuevoNombre.trim()}>
            <Plus className="h-4 w-4" />
            Agregar
          </Button>
          <Button size="sm" variant="outline" onClick={() => setVerInactivos(!verInactivos)}>
            {verInactivos ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {verInactivos ? 'Solo activos' : 'Ver inactivos'}
          </Button>
        </div>
        <div className="overflow-auto flex-1 border rounded-md">
          {loading ? (
            <p className="p-4 text-muted-foreground">Cargando...</p>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-2 p-2 hover:bg-muted/50">
                  {editId === item.id ? (
                    <>
                      <Input
                        value={editNombre}
                        onChange={(e) => { setEditNombre(e.target.value); setEditError(null) }}
                        className="flex-1 h-9"
                        autoFocus
                        placeholder="Nombre (obligatorio)"
                      />
                      {editError && <span className="text-sm text-destructive">{editError}</span>}
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(item.id, { nombre: editNombre.trim() })}
                        disabled={!editNombre.trim()}
                      >
                        Guardar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditId(null); setEditNombre(''); setEditError(null) }}>
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1">{item.nombre}</span>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditId(item.id); setEditNombre(item.nombre); setEditError(null) }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdate(item.id, { activo: !item.activo })}
                      >
                        {item.activo ? 'Desactivar' : 'Reactivar'}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
          {!loading && items.length === 0 && (
            <p className="p-4 text-muted-foreground">No hay registros en este catálogo.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
