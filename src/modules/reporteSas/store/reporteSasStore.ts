import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useFetch } from '@vueuse/core'

const REPORT_ENDPOINT = '/pc/extraccionDatosGM/searchMatDescargados.html'

export interface ReporteSasDto {
  nroOT: string
  estadoOT: string
  gestionada: string
  codTarea: string
  localidad: string
  codPostal: string
  legajoOperadorDescarga: string
  nomApeOperadorDescarga: string
  fechaDescarga: string
  legajoCierreOT: string
  nomApeCierreOT: string
  legajoNOLDAP: string
  fechaCierreOT: string
  centro: string
  almacen: string
  serialCodMaterial: string
  descMaterial: string
  cantidadMaterial: number
  tipoDescarga: string
  mensajeSAP: string
  fechaNotificacionSAP: string
}

export interface ReporteSasRow extends ReporteSasDto {
  _rowKey: string
}

interface ReporteSasPayload {
  data?: ReporteSasDto[]
  rows?: ReporteSasDto[]
}

type ReporteSasResponse = ReporteSasDto[] | ReporteSasPayload

const addRowKey = (
  row: ReporteSasDto,
  index: number
): ReporteSasRow => ({
  ...row,
  _rowKey: [
    row.nroOT,
    row.codTarea,
    row.serialCodMaterial,
    index,
  ].join('-'),
})

export const useReporteSasStore = defineStore('reporteSas', () => {
  const rows = ref<ReporteSasRow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const hasRows = computed(() => rows.value.length > 0)

  const fetchRows = async (): Promise<void> => {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError, response } = await useFetch( REPORT_ENDPOINT, { credentials: 'include' } )
        .get()
        .json<ReporteSasResponse>()

      if (
        response.value?.status === 401 ||
        response.value?.status === 403
      ) {
        throw new Error('No autorizado para consultar Reporte SAS.')
      }

      if (fetchError.value) {
        throw new Error(fetchError.value)
      }

      const payload = data.value

      const sourceRows: ReporteSasDto[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.rows)
            ? payload.rows
            : []

      console.log("en el store: ", rows.value)      

      rows.value = sourceRows.map(addRowKey)
    } catch (caughtError: unknown) {
      rows.value = []
      error.value =
        caughtError instanceof Error
          ? caughtError.message
          : 'Error al cargar los datos del reporte SAS.'
      throw caughtError
    } finally {
      loading.value = false
    }
  }

  const clearStore = (): void => {
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


