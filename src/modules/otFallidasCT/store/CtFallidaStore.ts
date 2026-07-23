import { defineStore } from 'pinia'
import { useFetch } from '@vueuse/core'
import type { Filters, Row, StoreState, ActionResponse, ExcluirRequest, IncluirRequest } from './types'
import { emptyFilters } from './types'

const EMPTY_NOTE_VALUES = new Set([
    '',
    'null',
    'undefined',
    'n',
    'no',
    'false',
    '0',
    '-',
    '--',
    'sin nota'
])

const normalizeVisibleText = (value: unknown): string => String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const normalizeNoteRow = (row: Row): Row => {
    const noteText = normalizeVisibleText(row.nota)
    const normalizedNote = noteText.toLowerCase()
    const noteFlag = normalizeVisibleText(row.tieneNota).toLowerCase()
    const explicitlyWithoutNote = ['n', 'no', 'false', '0'].includes(noteFlag)
    const hasVisibleNote = !EMPTY_NOTE_VALUES.has(normalizedNote)
    const hasNote = !explicitlyWithoutNote && hasVisibleNote

    return {
        ...row,
        nota: hasNote ? row.nota : '',
        tieneNota: hasNote ? 'S' : 'N'
    }
}

export const useFallidasCtStore = defineStore('fallidasCT', {
    state: (): StoreState => ({
        activeTab: ['0'],
        filters: emptyFilters(),
        rows: [],
        selectedRows: [],
        nroOT: null,
        loading: false,
    }),

    getters: {
        getRow: (state: StoreState) => (index: number): Row | undefined =>
            state.rows[index],
        
        selectedNotExcludedRows: (state: StoreState): Row[] =>
            state.selectedRows
                .map(id => state.rows.find(row => row.id === id))
                .filter((row): row is Row => row !== undefined)
                .filter(row => row.excluida === 'N')
    },

    actions: {
        setFilter<K extends keyof Filters>(key: K, value: Filters[K]): void {
            this.filters[key] = value
        },        
        async setData() {
            this.loading = true;
            const { data } = await useFetch('/pc/registroOTFallidasReproceso/searchFallidas.html')
                .post(this.filters)
                .json<Row[]>() 
            this.loading = false;    
            if (data.value) {
                this.activeTab = ['1']
                this.rows = data.value.map(normalizeNoteRow)
            }
        },
        setSelectedRows(rows: number[]): void {
            this.selectedRows = rows;
        },
        markIncluded(nroOT: string | number | null): void {
            const target = String(nroOT ?? '').trim()
            if (!target) return

            this.rows = this.rows.map((row) => (
                String(row.nroOrdenTrabajo ?? '').trim() === target
                    ? { ...row, excluida: 'N' }
                    : row
            ))
        },
        async sendReproceso(): Promise<void> {
            const idsSeleccionados = [...this.selectedRows]

            if (!idsSeleccionados.length) return

            const { error } = await useFetch('/pc/registroOTFallidasReproceso/reprocesar.html')
                .post(idsSeleccionados)

            if (error.value) {
                throw new Error(String(error.value))
            }
        },
        async sendExcluidas(motivo: string, comentario: string): Promise<ActionResponse> {
            this.loading = true;
            try {
                const payload: ExcluirRequest = {
                    idOts: this.selectedNotExcludedRows.map(row => row.id.toString()),
                    nota: comentario,
                    motivoNombreCorto: motivo
                }
                const { data, error } = await useFetch('/pc/registroOTFallidasReproceso/excluirOTFallida.html')
                    .post(payload)
                    .json<ActionResponse>() 
                if (error.value) {
                    return {status: false, respuesta: String(error.value)}
                }
                if (!data.value) {
                    return { status: false, respuesta: 'Respuesta vacía del servidor' }
                } 
                return data.value
            } finally {
                this.loading = false
            }
        },
        async sendIncluir(ot:string, motivo: string, comentario: string): Promise<ActionResponse> {
            this.loading = true;
            try {
                const payload: IncluirRequest = {
                    nroOts: [this.nroOT != null? this.nroOT : ''],
                    nota: comentario,
                    motivoNombreCorto: motivo
                }
                const { data, error } = await useFetch('/pc/registroOTFallidasReproceso/incluirOTFallidaExcluida.html')
                    .post(payload)
                    .json<ActionResponse>() 
                if (error.value) {
                    return {status: false, respuesta: String(error.value)}
                }
                if (!data.value) {
                    return { status: false, respuesta: 'Respuesta vacía del servidor' }
                } 
                return data.value
            } finally {
                this.loading = false
            }
        },
        clearFilters() {
            this.filters = emptyFilters()
        },
        clearStore(): void {
            this.$reset()
        },
    },
})
