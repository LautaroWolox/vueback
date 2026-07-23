import { defineStore } from 'pinia'
import { EncryptStorageNoble } from 'encrypt-storage';
import { useFetch } from '@vueuse/core'

interface Usuario {
    nombre: string
    legajo: string
    email: string
}

interface PerfilState {
    autenticado: boolean
    rutas: string[]
    nombre: string
    legajo: string
    email: string
    usuario: Usuario | null
}

interface SetPerfilParams {
    autenticado: boolean
    rutas: string[]
    nombre: string
    email: string
    legajo: string
}

const clave = import.meta.env.VITE_PARAMETER1;
export const authStore = new EncryptStorageNoble('autorizacion', {
    stateManagementUse: true,
    prefix: '@app',
    storageType: 'sessionStorage',
});

export const useAuthStore = defineStore('auth', {
    state: (): PerfilState => ({
        autenticado: false,
        rutas: [],
        nombre: "",
        legajo: "",
        email: "",
        usuario: null
    }),
    actions: {
        async fetchUserData() {
            const { data, error, response } = await useFetch(
              `${window.location.origin}/pc/userData.html`,
              { credentials: 'include' }
            ).get().json()
            if (
              response.value?.status === 401 ||
              response.value?.status === 403 ||
              error.value ||
              !data.value?.autenticado
            ) {
                return null
            }
            this.setPerfil(data.value)
            return data.value
        },
        setPerfil({ autenticado, rutas, nombre, email, legajo}: SetPerfilParams) {
            this.autenticado = autenticado
            this.rutas = rutas
            this.nombre = nombre
            this.legajo = legajo
            this.email = email
            this.usuario = { nombre, legajo, email }
        },
        logout() {
            this.autenticado=false,
              this.rutas=[],
              this.nombre="",
              this.legajo="",
              this.email="",
              this.usuario=null
        },
    },
    persist: [
        {
            key: 'autorizacion',
            storage: {
                getItem: (key) => authStore.getItem(key) ?? null,
                setItem: (key, value) => authStore.setItem(key, value),
            },
        },
    ],
}, )
