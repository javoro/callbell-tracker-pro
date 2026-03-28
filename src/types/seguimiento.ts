export interface Seguimiento {
  id: string
  contacto: string
  celular: string
  temaId: string | null
  temaNombre: string
  fecha: string
  /** Etiqueta de periodo semanal (ej. S01, S02…) según la fecha. Lunes a domingo ISO. */
  periodoEtiqueta?: string
  motivoContactoId: string | null
  motivoContactoNombre: string
  comproId: string | null
  comproNombre: string
  /** Campo capturable por el cliente (antes venía de catálogo). */
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
