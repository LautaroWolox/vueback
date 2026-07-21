import { defineStore } from 'pinia'
import { EncryptStorage } from 'encrypt-storage'
import { useFetch } from '@vueuse/core'
import type { Filters, Row, StoreState, ActionResponse, ExcluirRequest, IncluirRequest } from './types'
import { emptyFilters } from './types'

const clave = import.meta.env.VITE_PARAMETER1 as string;
export const fallidasCtStore = new EncryptStorage(clave, { storageType: 'sessionStorage' });

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
                .map(id => state.rows.find(row => row.id === id))   // busca en todos los datos las filas con los ids seleccionados
                .filter((row): row is Row => row !== undefined)     // elimina filas cuyo id no exista
                .filter(row => row.excluida === 'N')                // elimina filas ya excluidas
    },

    actions: {
        setFilter<K extends keyof Filters>(key: K, value: Filters[K]): void {
            this.filters[key] = value
        },        
        async setData() {
            this.loading = true;
            const { data, error } = await useFetch('/pc/registroOTFallidasReproceso/searchFallidas.html')
                .post(this.filters)
                .json<Row[]>() 
            this.loading = false;    
            if (data.value) {
                this.activeTab = ['1']
                this.rows = data.value
            } else {
                console.log('error: ' + JSON.stringify(error.value))   
            } 
        },
        setSelectedRows(rows: number[]): void {
            this.selectedRows = rows;
        },
        async sendReproceso() {
            await useFetch('/pc/registroOTFallidasReproceso/reprocesar.html')
                .post(this.selectedRows)
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
            console.log("incluir ot: ",ot)
            console.log("incluir motivo: ",motivo)
            console.log("incluir comentario: ",comentario)
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

