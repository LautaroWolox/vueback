import { defineStore } from 'pinia'
import { EncryptStorage } from 'encrypt-storage'

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
export const authStore = new EncryptStorage(clave, { storageType: 'sessionStorage' });

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
        setPerfil({ autenticado, rutas, nombre, email, legajo}: SetPerfilParams) {
            this.autenticado = autenticado
            this.rutas = rutas
            this.nombre = nombre
            this.legajo = legajo
            this.email = email
            this.usuario = { nombre, legajo, email }
        },
        logout() {
            this.$reset()
        },
    },
    persist: [
        {
            key: 'auth',             
            storage: {
                getItem: (key) => authStore.getItem(key) ?? null,
                setItem: (key, value) => authStore.setItem(key, value),
            },
        },
    ],
}, )
