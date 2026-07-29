import { defineStore } from 'pinia'

const now = () => new Date().toLocaleString('es-AR')

export const useCmoActividadStore = defineStore('cmoActividad', {
  state: () => ({
    rows: [],
    loading: false,
    error: null
  }),

  actions: {
    setRows(rows = []) {
      this.rows = Array.isArray(rows) ? rows : []
    },

    addMany(rows = [], usuario = 'usuario') {
      const createdRows = rows.map((row) => ({
        ...row,
        usuarioModificacion: usuario,
        fechaModificacion: now(),
        activo: row.activo || 'S'
      }))

      this.rows = [...this.rows, ...createdRows]
      return createdRows
    },

    updateById(id, changes = {}, usuario = 'usuario') {
      let updatedRow = null

      this.rows = this.rows.map((row) => {
        if (row.id !== id) return row

        updatedRow = {
          ...row,
          ...changes,
          usuarioModificacion: usuario,
          fechaModificacion: now()
        }

        return updatedRow
      })

      return updatedRow
    },

    removeById(id) {
      const removedRow = this.rows.find((row) => row.id === id) || null
      this.rows = this.rows.filter((row) => row.id !== id)
      return removedRow
    }
  }
})
