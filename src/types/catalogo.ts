export type TipoCatalogo =
  | 'tema'
  | 'motivoContacto'
  | 'compro'
  | 'vendedor'
  | 'departamento'

export interface CatalogoItem {
  id: string
  tipoCatalogo: TipoCatalogo
  nombre: string
  activo: boolean
  orden: number
  createdAt: string
  updatedAt: string
}
