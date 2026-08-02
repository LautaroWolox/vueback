import { FilterMatchMode } from '@primevue/core/api'
import type { BuscadorOtColumn } from '../store/types'

export const columns: BuscadorOtColumn[] = [
  { field: 'nroOt', header: 'Nro de OT', width: '135px' },
  { field: 'nroOtSfs', header: 'Nro OT SFS', width: '135px' },
  { field: 'statusOt', header: 'Status de la OT', width: '145px' },
  { field: 'statusOtWfx', header: 'Status OT WFX', width: '145px' },
  { field: 'fechaUltimaModificacion', header: 'Fecha Última Modificación', width: '185px' },
  { field: 'nroTech', header: 'Nro Tech', width: '135px' },
  { field: 'nombreTech', header: 'Nombre del Tech', width: '165px' },
  { field: 'codigoSolucion', header: 'Código de Solución', width: '150px' },
  { field: 'empresaContratista', header: 'Empresa Contratista', width: '175px' },
  { field: 'baseTecnica', header: 'Base Técnica', width: '145px' },
  { field: 'pais', header: 'Pais', width: '135px' },
  { field: 'actividades', header: 'Actividades', width: '150px' },
  { field: 'ubicacionOt', header: 'Ubicación de la OT', width: '170px' }
]

export const rowsOptions = [10, 50, 100]

export const createColumnFilters = () => Object.fromEntries(
  columns.map(({ field }) => [field, { value: null, matchMode: FilterMatchMode.CONTAINS }])
)
