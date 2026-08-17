export interface BuscadorOtRow {
  id?: string | number
  nroOt?: string
  nroOtSfs?: string
  statusOt?: string
  statusOtWfx?: string
  fechaUltimaModificacion?: string
  nroTech?: string
  nombreTech?: string
  codigoSolucion?: string
  empresaContratista?: string
  baseTecnica?: string
  provincia?: string
  pais?: string
  actividades?: string
  ubicacionOt?: string
  origenOt?: string
  [key: string]: unknown
}

export interface BuscadorOtColumn {
  field: keyof BuscadorOtRow | string
  header: string
  width: string
}
