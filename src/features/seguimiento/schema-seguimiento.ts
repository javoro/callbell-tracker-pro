import { z } from 'zod'

/**
 * Monto = valor de compra; Cotizado = valor cotizado; ambos opcionales y numéricos.
 * TODO: Si negocio exige folio/monto/dep cuando "Compró" = Sí, activar validación condicional
 * (p. ej. flag requiereFolioSiCompro en config o función central de validación).
 */
export const seguimientoFormSchema = z.object({
  contacto: z.string().min(1, 'Contacto obligatorio').transform((s) => s.trim()),
  celular: z.string().min(1, 'Celular obligatorio').transform((s) => s.trim()),
  fecha: z.string().min(1, 'Fecha obligatoria'),
  temaId: z.string().min(1, 'Tema obligatorio'),
  motivoContactoId: z.string().min(1, 'Motivo de compra o no compra obligatorio'),
  comproId: z.string().optional(),
  /** Campo libre capturable por el cliente (antes venía de catálogo). */
  cotizacionPedido: z.string().transform((s) => s.trim()).optional().default(''),
  vendedorId: z.string().min(1, 'Vendedor obligatorio'),
  monto: z.union([z.string(), z.number()]).transform((v) => (v === '' || v == null ? null : Number(v))).optional().nullable(),
  cotizado: z.union([z.string(), z.number()]).transform((v) => (v === '' || v == null ? null : Number(v))).optional().nullable(),
  folioFactura: z.string().transform((s) => (s ?? '').trim()).optional().default(''),
  departamentoId: z.string().min(1, 'Departamento obligatorio'),
})

export type SeguimientoFormValues = z.infer<typeof seguimientoFormSchema>
