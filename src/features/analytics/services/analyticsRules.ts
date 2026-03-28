/**
 * Reglas de negocio para métricas de la sección Otras.
 * Centralizadas para facilitar ajustes sin tocar componentes.
 */

import type { Seguimiento } from '@/types/seguimiento'

const SIN_ESPECIFICAR = 'Sin especificar'

/** Registro que representa oportunidad cotizada (tiene cotizado > 0 o cotización/pedido indicado). */
export function esCotizacion(s: Seguimiento): boolean {
  const hasCotizado = s.cotizado != null && s.cotizado > 0
  const hasCotizacionPedido =
    (s.cotizacionPedido ?? '').trim() !== '' && s.cotizacionPedido !== SIN_ESPECIFICAR
  return hasCotizado || !!hasCotizacionPedido
}

/** Registro con compra positiva (compró = Sí). */
export function esVentaCerrada(s: Seguimiento): boolean {
  const n = (s.comproNombre ?? '').trim().toLowerCase()
  return n === 'sí' || n === 'si'
}

/** Tiene celular informado (no vacío). */
export function tieneCelular(s: Seguimiento): boolean {
  return (s.celular ?? '').trim() !== ''
}

/** Tiene vendedor asignado (no vacío ni "Sin especificar"). */
export function tieneVendedor(s: Seguimiento): boolean {
  const v = (s.vendedorNombre ?? '').trim()
  return v !== '' && v !== SIN_ESPECIFICAR
}

/** Tiene cotizado informado y > 0. */
export function tieneCotizado(s: Seguimiento): boolean {
  return s.cotizado != null && s.cotizado > 0
}

/** Registro considerado "completo" para calidad (celular, vendedor, cotizado, compra definida). */
export function esRegistroCompleto(s: Seguimiento): boolean {
  return tieneCelular(s) && tieneVendedor(s) && (s.cotizado != null || esVentaCerrada(s)) && (s.comproNombre ?? '').trim() !== ''
}
