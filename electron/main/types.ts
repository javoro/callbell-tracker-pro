/** Tipos usados en main process (espejo de src/types para no depender del renderer) */
export interface Seguimiento {
  id: string
  contacto: string
  celular: string
  temaId: string | null
  temaNombre: string
  fecha: string
  periodoEtiqueta?: string
  motivoContactoId: string | null
  motivoContactoNombre: string
  comproId: string | null
  comproNombre: string
  cotizacionPedido: string
  vendedorId: string | null
  vendedorNombre: string
  monto: number | null
  cotizado: number | null
  folioFactura: string
  departamentoId: string | null
  departamentoNombre: string
  createdAt: string
  updatedAt: string
  activo: boolean
}

export interface CatalogoItem {
  id: string
  tipoCatalogo: string
  nombre: string
  activo: boolean
  orden: number
  createdAt: string
  updatedAt: string
}

export interface Configuracion {
  tipoCorte: 'diario' | 'semanal' | 'personalizado'
  fechaInicioPersonalizada: string | null
  fechaFinPersonalizada: string | null
  diaInicioSemana: number
  rutaExportacionPorDefecto: string | null
  ultimaFechaUso: string | null
  metaSemanal?: number | null
}
