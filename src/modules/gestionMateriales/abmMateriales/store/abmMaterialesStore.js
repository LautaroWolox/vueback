import { defineStore } from 'pinia'
import { ref } from 'vue'

const MOCK_DELAY = 180

const initialMaterials = [
  {
    codigoMaterial: '1000102813',
    descripcionMaterial: 'PATCH CORD FO-SM/APC, SC/APC-SC/APC',
    umbralMaximo: 20,
    umbralMedio: 10,
    umbralMinimo: 1,
    fechaUltimaModificacion: '03/08/2026 16:20:00',
    usuarioModificacion: 'L000001',
    activo: 'S'
  },
  {
    codigoMaterial: '1000102814',
    descripcionMaterial: 'CONECTOR ÓPTICO SC/APC',
    umbralMaximo: 40,
    umbralMedio: 20,
    umbralMinimo: 1,
    fechaUltimaModificacion: '02/08/2026 11:45:12',
    usuarioModificacion: 'L000002',
    activo: 'S'
  },
  {
    codigoMaterial: '1000102815',
    descripcionMaterial: 'ROSETA ÓPTICA DE INTERIOR',
    umbralMaximo: 15,
    umbralMedio: 8,
    umbralMinimo: 1,
    fechaUltimaModificacion: '01/08/2026 09:12:35',
    usuarioModificacion: 'L000003',
    activo: 'N'
  },
  {
    codigoMaterial: '1000102816',
    descripcionMaterial: 'CABLE DROP FIGURA 8 - 100 M',
    umbralMaximo: 80,
    umbralMedio: 35,
    umbralMinimo: 1,
    fechaUltimaModificacion: '31/07/2026 18:05:04',
    usuarioModificacion: 'L000004',
    activo: 'S'
  },
  {
    codigoMaterial: '1000102817',
    descripcionMaterial: 'CAJA TERMINAL ÓPTICA 16 PUERTOS',
    umbralMaximo: 12,
    umbralMedio: 6,
    umbralMinimo: 1,
    fechaUltimaModificacion: '30/07/2026 14:10:22',
    usuarioModificacion: 'L000005',
    activo: 'S'
  }
]

const cloneRows = (rows) => rows.map((row) => ({ ...row }))
const wait = (milliseconds = MOCK_DELAY) => new Promise((resolve) => setTimeout(resolve, milliseconds))
const normalizeCode = (value) => String(value ?? '').trim().toUpperCase()

const formatDateTime = (date = new Date()) => {
  const pad = (value) => String(value).padStart(2, '0')

  return [
    `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  ].join(' ')
}

export const useAbmMaterialesStore = defineStore('abmMateriales', () => {
  const materiales = ref([])
  const loading = ref(false)
  const error = ref(null)
  const initialized = ref(false)

  const fetchMateriales = async () => {
    loading.value = true
    error.value = null

    try {
      await wait()

      if (!initialized.value) {
        materiales.value = cloneRows(initialMaterials)
        initialized.value = true
      }

      return materiales.value
    } catch (cause) {
      error.value = cause instanceof Error
        ? cause.message
        : 'No fue posible consultar los materiales.'
      throw cause
    } finally {
      loading.value = false
    }
  }

  const crearMaterial = async (payload) => {
    loading.value = true
    error.value = null

    try {
      await wait()

      const normalizedCode = normalizeCode(payload.codigoMaterial)
      const existing = materiales.value.find(
        (material) => normalizeCode(material.codigoMaterial) === normalizedCode
      )

      if (existing) {
        return {
          ok: false,
          reason: existing.activo === 'S' ? 'ACTIVE_EXISTS' : 'INACTIVE_EXISTS'
        }
      }

      const material = {
        codigoMaterial: String(payload.codigoMaterial).trim(),
        descripcionMaterial: String(payload.descripcionMaterial).trim(),
        umbralMaximo: Number(payload.umbralMaximo),
        umbralMedio: Number(payload.umbralMedio),
        umbralMinimo: 1,
        fechaUltimaModificacion: formatDateTime(),
        usuarioModificacion: String(payload.usuarioModificacion || '').trim() || 'USUARIO_LOCAL',
        activo: 'S'
      }

      materiales.value = [material, ...materiales.value]
      return { ok: true, material }
    } catch (cause) {
      error.value = cause instanceof Error
        ? cause.message
        : 'No fue posible crear el material.'
      throw cause
    } finally {
      loading.value = false
    }
  }

  const actualizarMaterial = async (payload) => {
    loading.value = true
    error.value = null

    try {
      await wait()

      const index = materiales.value.findIndex(
        (material) => normalizeCode(material.codigoMaterial) === normalizeCode(payload.codigoMaterial)
      )

      if (index === -1) throw new Error('No se encontró el material seleccionado.')
      if (materiales.value[index].activo !== 'S') {
        throw new Error('Los materiales desactivados no pueden editarse.')
      }

      const updated = {
        ...materiales.value[index],
        umbralMaximo: Number(payload.umbralMaximo),
        umbralMedio: Number(payload.umbralMedio),
        fechaUltimaModificacion: formatDateTime(),
        usuarioModificacion: String(payload.usuarioModificacion || '').trim() || 'USUARIO_LOCAL'
      }

      materiales.value.splice(index, 1, updated)
      return updated
    } catch (cause) {
      error.value = cause instanceof Error
        ? cause.message
        : 'No fue posible actualizar el material.'
      throw cause
    } finally {
      loading.value = false
    }
  }

  return {
    materiales,
    loading,
    error,
    fetchMateriales,
    crearMaterial,
    actualizarMaterial
  }
})
