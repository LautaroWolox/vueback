import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const REPORT_ENDPOINT = '/pc/extraccionDatosGM/searchMatDescargados.html'

const firstDefined = (row, aliases, fallback = '') => {
  for (const alias of aliases) {
    const value = row?.[alias]
    if (value !== undefined && value !== null) return value
  }

  return fallback
}

const normalizeLegajos = (value) => {
  if (!value) return ''

  const values = Array.isArray(value) ? value : String(value).split(',')

  return values
    .map((item) => String(item).trim())
    .filter(Boolean)
    .join(',')
}

const normalizeRow = (row, index) => ({
  ...row,
  _rowKey:
    firstDefined(row, ['id', 'materialDescargadoId', 'nroRegistro'], null) ??
    `${firstDefined(row, ['nroOT', 'nroOt'], 'OT')}-${index}`,
  nroOT: firstDefined(row, ['nroOT', 'nroOt', 'numeroOT', 'numeroOt']),
  estadoOT: firstDefined(row, ['estadoOT', 'estadoOt', 'estado']),
  gestionada: firstDefined(row, ['gestionada', 'gestionado']),
  codTarea: firstDefined(row, ['codTarea', 'codigoTarea', 'tareaCodigo']),
  localidad: firstDefined(row, ['localidad']),
  codPostal: firstDefined(row, ['codPostal', 'codigoPostal']),
  legajoOperadorDescarga: firstDefined(row, [
    'legajoOperadorDescarga',
    'legajoDescarga',
    'operadorDescargaLegajo',
  ]),
  nomApeOperadorDescarga: firstDefined(row, [
    'nomApeOperadorDescarga',
    'nombreOperadorDescarga',
    'operadorDescargaNombre',
  ]),
  fechaDescarga: firstDefined(row, ['fechaDescarga']),
  legajoCierreOT: firstDefined(row, ['legajoCierreOT', 'legajoCierreOt']),
  nomApeCierreOT: firstDefined(row, [
    'nomApeCierreOT',
    'nomApeCierreOt',
    'nombreOperadorCierreOT',
    'nombreOperadorCierreOt',
  ]),
  legajoNOLDAP: normalizeLegajos(
    firstDefined(row, ['legajoNOLDAP', 'legajoNoldap', 'legajosNOLDAP'])
  ),
  fechaCierreOT: firstDefined(row, ['fechaCierreOT', 'fechaCierreOt']),
  centro: firstDefined(row, ['centro']),
  almacen: firstDefined(row, ['almacen', 'almacén']),
  serialCodMaterial: firstDefined(row, [
    'serialCodMaterial',
    'serialMaterial',
    'numeroSerie',
    'nroSerie',
    'serial',
  ]),
  codMaterial: firstDefined(row, [
    'codMaterial',
    'codigoMaterial',
    'materialCodigo',
    'codigoSAPMaterial',
    'codMat',
  ]),
  descMaterial: firstDefined(row, [
    'descMaterial',
    'descripcionMaterial',
    'materialDescripcion',
  ]),
  cantidadMaterial: firstDefined(row, ['cantidadMaterial', 'cantidad'], ''),
  tipoDescarga: firstDefined(row, ['tipoDescarga']),
  mensajeSAP: firstDefined(row, ['mensajeSAP', 'mensajeSap']),
  fechaNotificacionSAP: firstDefined(row, [
    'fechaNotificacionSAP',
    'fechaNotificacionSap',
  ]),
})

export const useReporteSasStore = defineStore('reporteSas', () => {
  const rows = ref([])
  const loading = ref(false)
  const error = ref(null)

  const hasRows = computed(() => rows.value.length > 0)

  const fetchRows = async () => {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      const response = await fetch(REPORT_ENDPOINT, {
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`No se pudo cargar Reporte SAS (${response.status})`)
      }

      const payload = await response.json()
      const sourceRows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.rows)
            ? payload.rows
            : []

      rows.value = sourceRows.map(normalizeRow)
    } catch (fetchError) {
      rows.value = []
      error.value =
        fetchError instanceof Error
          ? fetchError.message
          : 'Error al cargar los datos del reporte SAS.'
      throw fetchError
    } finally {
      loading.value = false
    }
  }

  const clearStore = () => {
    rows.value = []
    error.value = null
    loading.value = false
  }

  return {
    rows,
    loading,
    error,
    hasRows,
    fetchRows,
    clearStore,
  }
})
