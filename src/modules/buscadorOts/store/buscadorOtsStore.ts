import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { BuscadorOtRow } from './types'

export const useBuscadorOtsStore = defineStore('buscadorOts', () => {
  const otListText = ref('')
  const rows = ref<BuscadorOtRow[]>([])
  const externalRows = ref<BuscadorOtRow[]>([])
  const searching = ref(false)
  const failedOnly = ref(false)
  const showColumnFilters = ref(false)
  const first = ref(0)
  const pageRows = ref(100)
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

  const visibleRows = computed(() => (
    failedOnly.value ? rows.value.filter(isFailedRow) : rows.value
  ))

  const searchOts = async () => {
    if (!parsedOtNumbers.value.length || searching.value) return

    searching.value = true
    first.value = 0

    try {
      // La conexión con el endpoint legacy se agrega cuando se confirme su
      // contrato de request/response. No se inventan datos ni URLs.
      rows.value = []
      externalRows.value = []
    } finally {
      searching.value = false
    }
  }

  const clearSearch = () => {
    otListText.value = ''
    rows.value = []
    externalRows.value = []
    failedOnly.value = false
    showColumnFilters.value = false
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
    first.value = 0
  }

  const resetStore = () => {
    clearSearch()
    pageRows.value = 100
  }

  return {
    otListText,
    rows,
    externalRows,
    searching,
    failedOnly,
    showColumnFilters,
    first,
    pageRows,
    resetToken,
    parsedOtNumbers,
    visibleRows,
    searchOts,
    clearSearch,
    toggleColumnFilters,
    toggleFailedFilter,
    resetStore
  }
})
