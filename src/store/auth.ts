import { defineStore } from 'pinia'
import { EncryptStorageNoble } from 'encrypt-storage';
import { useFetch } from '@vueuse/core'

interface Usuario {
    nombre: string
    apellido: string
    legajo: string
    email: string
}

interface PerfilState {
    autenticado: boolean
    rutas: string[]
    nombre: string
    apellido: string
    legajo: string
    email: string
    usuario: Usuario | null
}

type PerfilUsuarioRaw = Record<string, unknown>

interface SetPerfilParams extends Record<string, unknown> {
    autenticado?: boolean
    rutas?: string[]
    nombre?: string
    nombres?: string
    apellido?: string
    apellidos?: string
    nombreCompleto?: string
    nombreApellido?: string
    nombreYApellido?: string
    displayName?: string
    fullName?: string
    email?: string
    legajo?: string
    usuario?: PerfilUsuarioRaw | null
}

const toText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const firstText = (...values: unknown[]) => values.map(toText).find(Boolean) ?? ''

const formatNamePart = (value: string) => value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.length <= 2
        ? part.toUpperCase()
        : `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(' ')

const nameFromEmail = (email: string) => {
    const localPart = email.split('@')[0]?.trim() ?? ''
    const parts = localPart
        .split(/[._-]+/)
        .map((part) => part.trim())
        .filter(Boolean)

    if (parts.length < 2 || parts.every((part) => /^[a-z]?\d+$/i.test(part))) return ''
    return parts.map(formatNamePart).join(' ')
}

const resolveDisplayName = (perfil: SetPerfilParams) => {
    const nested = perfil.usuario && typeof perfil.usuario === 'object' ? perfil.usuario : {}
    const legajo = firstText(perfil.legajo, nested.legajo)

    const explicitName = firstText(
        perfil.nombreCompleto,
        perfil.nombreApellido,
        perfil.nombreYApellido,
        perfil.displayName,
        perfil.fullName,
        nested.nombreCompleto,
        nested.nombreApellido,
        nested.nombreYApellido,
        nested.displayName,
        nested.fullName
    )

    if (explicitName && explicitName.toLowerCase() !== legajo.toLowerCase()) {
        return explicitName
    }

    const givenNames = firstText(perfil.nombres, nested.nombres)
    const surnames = firstText(
        perfil.apellidos,
        perfil.apellido,
        nested.apellidos,
        nested.apellido
    )
    const combinedName = [givenNames, surnames].filter(Boolean).join(' ').trim()

    if (combinedName) return combinedName

    const simpleName = firstText(perfil.nombre, nested.nombre)
    if (simpleName && simpleName.toLowerCase() !== legajo.toLowerCase()) {
        if (surnames && !simpleName.toLowerCase().includes(surnames.toLowerCase())) {
            return `${simpleName} ${surnames}`.trim()
        }
        return simpleName
    }

    const email = firstText(perfil.email, nested.email)
    return nameFromEmail(email) || simpleName || legajo
}

const resolveSurname = (perfil: SetPerfilParams) => {
    const nested = perfil.usuario && typeof perfil.usuario === 'object' ? perfil.usuario : {}

    return firstText(
        perfil.apellidos,
        perfil.apellido,
        nested.apellidos,
        nested.apellido
    )
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
        apellido: "",
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
        setPerfil(perfil: SetPerfilParams) {
            const nested = perfil.usuario && typeof perfil.usuario === 'object' ? perfil.usuario : {}
            const autenticado = Boolean(perfil.autenticado)
            const rutas = Array.isArray(perfil.rutas) ? perfil.rutas : []
            const legajo = firstText(perfil.legajo, nested.legajo)
            const email = firstText(perfil.email, nested.email)
            const nombre = resolveDisplayName(perfil)
            const apellido = resolveSurname(perfil)

            this.autenticado = autenticado
            this.rutas = rutas
            this.nombre = nombre
            this.apellido = apellido
            this.legajo = legajo
            this.email = email
            this.usuario = { nombre, apellido, legajo, email }
        },
        normalizeDisplayName() {
            const nombre = resolveDisplayName({
                nombre: this.nombre,
                apellido: this.apellido,
                legajo: this.legajo,
                email: this.email,
                usuario: this.usuario
            })

            if (!nombre) return

            this.nombre = nombre
            this.usuario = {
                nombre,
                apellido: this.usuario?.apellido || this.apellido,
                legajo: this.usuario?.legajo || this.legajo,
                email: this.usuario?.email || this.email
            }
        },
        logout() {
            this.autenticado=false,
              this.rutas=[],
              this.nombre="",
              this.apellido="",
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