import dayjs from 'dayjs'

/**
 * Encabezados del Excel; centralizados aquí para ajuste rápido.
 */
export const EXCEL_HEADERS = [
  'Contacto',
  'Celular',
  'Tema',
  'Fecha',
  'Periodo',
  'Motivo de compra o no compra',
  'Compró',
  'Cotización o pedido',
  'Vendedor',
  'Monto',
  'Cotizado',
  'Folio factura',
  'Departamento',
] as const

export async function exportarExcel(seguimientos: Array<{
  contacto: string
  celular: string
  temaNombre: string
  fecha: string
  motivoContactoNombre: string
  comproNombre: string
  cotizacionPedido: string
  vendedorNombre: string
  monto: number | null
  cotizado: number | null
  folioFactura: string
  departamentoNombre: string
}>): Promise<void> {
  if (!window.electronAPI) {
    alert('No está disponible la exportación.')
    return
  }
  const defaultName = `seguimiento_${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`
  const result = await window.electronAPI.dialogShowSaveDialog({
    defaultPath: defaultName,
    filters: [{ name: 'Excel', extensions: ['xlsx'] }],
  })
  if (result.canceled || !result.filePath) return
  const r = await window.electronAPI.exportExcel({ seguimientos, filePath: result.filePath })
  if (r.ok) {
    alert('Exportación completada correctamente.')
  } else {
    alert('Error al exportar: ' + (r.error ?? 'Error desconocido'))
  }
}
