export interface Configuracion {
  tipoCorte: 'diario' | 'semanal' | 'personalizado'
  fechaInicioPersonalizada: string | null
  fechaFinPersonalizada: string | null
  diaInicioSemana: number
  rutaExportacionPorDefecto: string | null
  ultimaFechaUso: string | null
  /** Meta de ventas semanal (opcional) para analíticas. */
  metaSemanal: number | null
}
