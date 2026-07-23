import { defineStore } from 'pinia'
import { useAuthStore } from '@/store/auth'
import { useFetch } from '@vueuse/core'

const normalizeRows = (payload) => {
    if (!payload) return []
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload.data)) return payload.data
    if (Array.isArray(payload.resultados)) return payload.resultados
    return [payload]
}

const parsePayload = (value) => {
    if (value == null || value === '') return null
    if (typeof value !== 'string') return value
    return JSON.parse(value)
}

const useEmulacionStore = defineStore('emulacionStore', {
    state: () => ({
        legajoSelected: '',
        activeTab: ['0'],
        toggleLoader: false,
        data: [],
        error_code: '',
        error_message: '',
        selectedOperator: null,
        confirmationVersion: 0,
        authStore: useAuthStore()
    }),

    actions: {
        $setlegajoSelected(selection) {
            this.legajoSelected = String(selection ?? '').trim()
        },

        $setActiveTab(value) {
            const values = Array.isArray(value) ? value : [value]
            this.activeTab = values.map(String)
        },

        $resetFilters() {
            this.legajoSelected = ''
            this.data = []
            this.selectedOperator = null
            this.error_code = ''
            this.error_message = ''
            this.activeTab = ['0']
        },

        $resetData() {
            this.data = []
            this.selectedOperator = null
        },

        $requestConfirmation(operator) {
            if (!operator) return
            this.selectedOperator = operator
            this.legajoSelected = String(operator.legajo ?? this.legajoSelected ?? '').trim()
            this.confirmationVersion += 1
        },

        $clearConfirmation() {
            this.selectedOperator = null
        },

        async $fetchData() {
            this.error_code = ''
            this.error_message = ''
            this.data = []
            this.selectedOperator = null

            const legajo = String(this.legajoSelected ?? '').trim()
            if (!legajo) {
                this.error_code = 400
                this.error_message = 'Ingrese un legajo'
                return
            }

            this.toggleLoader = true

            try {
                const { error, data, response } = await useFetch(
                    `/pc/emulacion/buscar.html?legajo=${encodeURIComponent(legajo)}`
                )

                if (error?.value) {
                    this.error_code = response?.value?.status || 500
                    this.error_message = String(error.value)
                    return
                }

                const parsed = parsePayload(data?.value)
                const rows = normalizeRows(parsed).filter(Boolean)
                this.data = rows

                if (!rows.length) {
                    this.error_code = 404
                    this.error_message = 'No se encontraron operadores'
                    return
                }

                this.$setActiveTab(['0', '1'])
                this.$requestConfirmation(rows[0])
            } catch (error) {
                this.error_code = 500
                this.error_message = error instanceof Error ? error.message : String(error)
                this.data = []
            } finally {
                this.toggleLoader = false
            }
        },

        async $emulate() {
            this.error_code = ''
            this.error_message = ''

            const legajo = String(this.legajoSelected ?? '').trim()
            if (!legajo) {
                this.error_code = 400
                this.error_message = 'No hay un operador seleccionado'
                return
            }

            try {
                const { error, data, response } = await useFetch(
                    `/pc/emulacion/cambiarUsuario.html?legajo=${encodeURIComponent(legajo)}`
                )

                if (error?.value) {
                    this.error_code = response?.value?.status || 500
                    this.error_message = String(error.value)
                    return
                }

                const parsed = parsePayload(data?.value)
                if (!parsed) {
                    this.error_code = 500
                    this.error_message = 'La respuesta de emulación está vacía'
                    return
                }

                this.authStore.setPerfil({
                    autenticado: true,
                    rutas: parsed.rutas,
                    nombre: parsed.nombre,
                    email: parsed.email,
                    legajo: parsed.legajo
                })
            } catch (error) {
                this.error_code = 500
                this.error_message = error instanceof Error ? error.message : String(error)
            }
        }
    }
})

export default useEmulacionStore
