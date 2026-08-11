import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { BuscadorOtRow } from './types'
import {
  buildMockSearchRows,
  type MockTechnician
} from '../mocks/reprocesoMocks'

export const useBuscadorOtsStore = defineStore('buscadorOts', () => {
  const otListText = ref('')
  const rows = ref<BuscadorOtRow[]>([])
  const externalRows = ref<BuscadorOtRow[]>([])
  const searching = ref(false)
  const failedOnly = ref(false)
  const showColumnFilters = ref(false)
  const selectedRow = ref<BuscadorOtRow | null>(null)
  const first = ref(0)
  const pageRows = ref(500)
  const resetToken = ref(0)

  const parsedOtNumbers = computed(() => (
    [...new Set(
      otListText.value
        .split(/[\s,;]+/)
        .map((value) => value.trim())
        .filter(Boolean)
    )]
  ))

  const isFailedRow = (row: BuscadorOtRow) => {
    const status = [row?.statusOt, row?.statusOtWfx]
      .filter(Boolean)
      .join(' ')
      .toUpperCase()

    return /FALLID|ERROR|FAILED|RECHAZ/.test(status)
  }

  const normalizeCondition = (value: unknown) => (
    String(value ?? '')
      .trim()
      .toUpperCase()
      .replace(/[\s_-]+/g, '')
  )

  const isEligibleForReprocess = (row: BuscadorOtRow) => {
    const status = normalizeCondition(row.statusOt)
    const actividades = normalizeCondition(row.actividades)
    const ubicacion = normalizeCondition(row.ubicacionOt)

    const isClosed = status.includes('CERRAD')
    const hasActivities = ['SI', 'S', 'TRUE', '1'].includes(actividades)
    const isGmOk = ubicacion === 'GMOK'

    return isClosed && hasActivities && isGmOk
  }

  const visibleRows = computed(() => (
    failedOnly.value ? rows.value.filter(isFailedRow) : rows.value
  ))

  const eligibleRows = computed(() => rows.value.filter(isEligibleForReprocess))

  const searchOts = async () => {
    if (!parsedOtNumbers.value.length || searching.value) return

    searching.value = true
    first.value = 0
    selectedRow.value = null

    try {
      if (import.meta.env.DEV) {
        rows.value = buildMockSearchRows(parsedOtNumbers.value)
        externalRows.value = []
        return
      }

      // El endpoint real se conecta cuando se confirme su contrato.
      // Los mocks quedan limitados al entorno local de desarrollo.
      rows.value = []
      externalRows.value = []
    } finally {
      searching.value = false
    }
  }

  const applyMockReprocess = (selectedRows: BuscadorOtRow[], technician: MockTechnician) => {
    const selectedIds = new Set(
      selectedRows.map((row) => String(row.id ?? row.nroOt ?? ''))
    )

    rows.value = rows.value.map((row) => {
      const rowId = String(row.id ?? row.nroOt ?? '')
      if (!selectedIds.has(rowId)) return row

      return {
        ...row,
        nroTech: technician.techId,
        nombreTech: technician.nombre,
        empresaContratista: technician.empresaContratista,
        baseTecnica: technician.baseTecnica,
        provincia: technician.provincia
      }
    })

    if (selectedRow.value) {
      const selectedId = String(selectedRow.value.id ?? selectedRow.value.nroOt ?? '')
      selectedRow.value = rows.value.find((row) => (
        String(row.id ?? row.nroOt ?? '') === selectedId
      )) ?? null
    }
  }

  const clearSearch = () => {
    otListText.value = ''
    rows.value = []
    externalRows.value = []
    failedOnly.value = false
    showColumnFilters.value = false
    selectedRow.value = null
    first.value = 0
    resetToken.value += 1
  }

  const toggleColumnFilters = () => {
    showColumnFilters.value = !showColumnFilters.value

    if (!showColumnFilters.value) {
      resetToken.value += 1
    }
  }

  const toggleFailedFilter = () => {
    failedOnly.value = !failedOnly.value
    selectedRow.value = null
    first.value = 0
  }

  const resetStore = () => {
    clearSearch()
    pageRows.value = 500
  }

  return {
    otListText,
    rows,
    externalRows,
    searching,
    failedOnly,
    showColumnFilters,
    selectedRow,
    first,
    pageRows,
    resetToken,
    parsedOtNumbers,
    visibleRows,
    eligibleRows,
    isEligibleForReprocess,
    searchOts,
    applyMockReprocess,
    clearSearch,
    toggleColumnFilters,
    toggleFailedFilter,
    resetStore
  }
})
