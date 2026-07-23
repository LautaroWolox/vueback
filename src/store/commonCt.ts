import { defineStore } from 'pinia'
import { EncryptStorageNoble } from 'encrypt-storage';
import { useFetch } from '@vueuse/core'
import type { StoreState, LoadStatus, Contratista, ActividadMotivo } from './interfaces/ctTypes.ts'

export const commonCtStore = new EncryptStorageNoble('commonCerti', {
    stateManagementUse: true,
    prefix: '@app',
    storageType: 'sessionStorage',
});
export const useCommonCtStore = defineStore('commonCT', {
    state: (): StoreState => ({
        contratistas: null as Contratista[] | null,
        motivos: null as ActividadMotivo[] | null,
        status: {
            contratistas: 'idle' as LoadStatus,
            motivos: 'idle' as LoadStatus,
        }
    }),
    getters: {

    },
    actions: {
        async setContratistas(): Promise<void> {
            if (this.status.contratistas === 'loading' || this.status.contratistas === 'loaded') {
                return
            }
            this.status.contratistas = 'loading'
            try {
                const { data, error } = await useFetch('/pc/registroOTFallidasReproceso/getContratistas.html')
                                                    .json<Contratista[]>()
                if (error.value) {
                    throw error.value
                }
                this.contratistas = data.value ?? []
                this.status.contratistas = 'loaded'
            } catch (error) {
                this.status.contratistas = 'error'
                throw error
            }
        },
        async setMotivosExcInc():Promise<void>{
            if (this.status.motivos === 'loading' || this.status.motivos === 'loaded') {
                return
            }
            this.status.motivos = 'loading'
            try {
                const { data, error } = await useFetch('/pc/detalleActa/getAllMotivos.html')
                                                    .json<ActividadMotivo[]>()
                if (error.value) {
                    throw error.value
                }
                this.motivos = data.value ?? []
                this.status.motivos = 'loaded'
            } catch (error) {
                this.status.motivos = 'error'
                throw error
            }
        },


    },

    persist: [
        {
            key: 'commonCerti',
            storage: {
                getItem: (key: string): string | null => commonCtStore.getItem(key) ?? null,
                setItem: (key: string, value: string): void => commonCtStore.setItem(key, value),
            },
        },
    ]
})