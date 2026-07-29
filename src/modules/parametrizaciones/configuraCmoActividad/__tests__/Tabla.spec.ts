import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Tabla from '../components/Tabla.vue'
import { useCmoActividadStore } from '../store/cmoActividadStore'
import { mainColumns } from '../components/columns'
import type { RelCmoActividad } from '../store/types'

// Mock useFetch (el store lo usa internamente)
vi.mock('@vueuse/core', () => ({
  useFetch: vi.fn(() => ({
    json: () => Promise.resolve({ data: { value: [] }, error: { value: null } }),
  })),
}))

// Mock useExcelExport
const mockExportToExcel = vi.fn()
vi.mock('@/composables/useExportExcel', () => ({
  useExcelExport: () => ({ exportToExcel: mockExportToExcel }),
}))

// Mock PrimeVue services
vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => ({ require: vi.fn() }),
}))
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: vi.fn() }),
}))

// Mock child dialogs
vi.mock('../components/AltaDialog.vue', () => ({
  default: { template: '<div data-testid="alta-dialog"></div>', props: ['visible'], emits: ['update:visible', 'saved'] },
}))
vi.mock('../components/ModificarDialog.vue', () => ({
  default: { template: '<div data-testid="modificar-dialog"></div>', props: ['visible', 'relacion'], emits: ['update:visible', 'saved'] },
}))

// Stubs para componentes PrimeVue y globales
const stubs = {
  DataTable: {
    template: `<div class="datatable-stub"><slot name="empty" /><slot name="paginatorcontainer" v-bind="paginatorProps" /><slot /></div>`,
    props: ['value', 'dataKey', 'filters', 'selection', 'first', 'rows', 'rowClass', 'multiSortMeta'],
    emits: ['update:filters', 'update:selection', 'update:first', 'update:rows', 'row-click'],
    computed: {
      paginatorProps() {
        return { first: 0, last: 10, page: 0, pageCount: 1, rows: 100, totalRecords: 0, firstPageCallback: () => {}, lastPageCallback: () => {}, prevPageCallback: () => {}, nextPageCallback: () => {}, rowChangeCallback: () => {}, changePageCallback: () => {} }
      },
    },
  },
  Column: { template: '<div class="column-stub"></div>', props: ['field', 'header', 'sortable', 'filter'] },
  InputText: { template: '<input class="inputtext-stub" />', props: ['modelValue'] },
  FmGridShell: { template: '<div class="grid-shell-stub"><slot /></div>', props: ['loading', 'loadingTitle', 'loadingMessage'] },
  FmGridPaginator: { template: '<div class="paginator-stub"><slot name="actions" /></div>', props: ['first', 'last', 'page', 'pageCount', 'rows', 'totalRecords', 'rowsOptions', 'counterText'] },
  FmGridActions: {
    template: '<div class="actions-stub"></div>',
    props: ['showRefresh', 'showEdit', 'showAdd', 'deleteDisabled', 'editDisabled', 'exportTitle', 'deleteTitle', 'editTitle', 'addTitle'],
    emits: ['export', 'delete', 'edit', 'add'],
  },
  ConfirmDialog: { template: '<div class="confirm-stub"></div>' },
  Toast: { template: '<div class="toast-stub"></div>' },
}

const mockRows: RelCmoActividad[] = [
  {
    actividadManoObraId: 1,
    codigoActividad: 'ACT001',
    descActividad: 'Instalación HFC',
    codigoS4: 'S4001',
    cmo: 'S4001 - CMO Norte',
    usuarioModificacion: 'usuario1',
    fechaModificacion: '01/01/2025 10:00:00',
    activo: 'S',
  },
  {
    actividadManoObraId: 2,
    codigoActividad: 'ACT002',
    descActividad: 'Reparación FTTH',
    codigoS4: 'S4002',
    cmo: 'S4002 - CMO Sur',
    usuarioModificacion: 'usuario2',
    fechaModificacion: '02/01/2025 11:00:00',
    activo: 'N',
  },
]

describe('Tabla.vue', () => {
  let wrapper: ReturnType<typeof mount>
  let store: ReturnType<typeof useCmoActividadStore>

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    store = useCmoActividadStore()

    wrapper = mount(Tabla, {
      global: {
        plugins: [pinia],
        stubs,
      },
    })

    vi.clearAllMocks()
  })

  describe('renderizado', () => {
    it('renderiza FmGridShell con loading del store', () => {
      const shell = wrapper.find('.grid-shell-stub')
      expect(shell.exists()).toBe(true)
    })

    it('renderiza DataTable con dataKey actividadManoObraId', () => {
      const dt = wrapper.findComponent(stubs.DataTable)
      expect(dt.exists()).toBe(true)
      expect(dt.props('dataKey')).toBe('actividadManoObraId')
    })

    it('renderiza las 7 columnas definidas', () => {
      const columns = wrapper.findAllComponents(stubs.Column)
      expect(columns).toHaveLength(mainColumns.length)
    })

    it('cada columna tiene field y header correctos', () => {
      const columns = wrapper.findAllComponents(stubs.Column)
      mainColumns.forEach((col, idx) => {
        expect(columns[idx].props('field')).toBe(col.field)
        expect(columns[idx].props('header')).toBe(col.header)
      })
    })

    it('renderiza FmGridActions con los botones correctos', () => {
      const actions = wrapper.findComponent(stubs.FmGridActions)
      expect(actions.exists()).toBe(true)
      expect(actions.props('showEdit')).toBe(true)
      expect(actions.props('showAdd')).toBe(true)
    })

    it('renderiza AltaDialog y ModificarDialog (ocultos)', () => {
      expect(wrapper.find('[data-testid="alta-dialog"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="modificar-dialog"]').exists()).toBe(true)
    })

    it('renderiza ConfirmDialog y Toast para servicios PrimeVue', () => {
      expect(wrapper.find('.confirm-stub').exists()).toBe(true)
      expect(wrapper.find('.toast-stub').exists()).toBe(true)
    })
  })

  describe('conexión con store', () => {
    it('pasa store.rows como value del DataTable', async () => {
      store.rows = mockRows
      await wrapper.vm.$nextTick()

      const dt = wrapper.findComponent(stubs.DataTable)
      expect(dt.props('value')).toEqual(mockRows)
    })

    it('pasa store.loading a FmGridShell', async () => {
      store.loading = true
      await wrapper.vm.$nextTick()

      const shell = wrapper.findComponent(stubs.FmGridShell)
      expect(shell.props('loading')).toBe(true)
    })

    it('botones Modificar y Desactivar deshabilitados sin selección', () => {
      const actions = wrapper.findComponent(stubs.FmGridActions)
      expect(actions.props('deleteDisabled')).toBe(true)
      expect(actions.props('editDisabled')).toBe(true)
    })

    it('botones se habilitan cuando hay fila seleccionada', async () => {
      store.setSelectedRow(mockRows[0])
      await wrapper.vm.$nextTick()

      const actions = wrapper.findComponent(stubs.FmGridActions)
      expect(actions.props('deleteDisabled')).toBe(false)
      expect(actions.props('editDisabled')).toBe(false)
    })
  })

  describe('sort default', () => {
    it('tiene multiSortMeta con codigoActividad descendente', () => {
      const dt = wrapper.findComponent(stubs.DataTable)
      expect(dt.props('multiSortMeta')).toEqual([{ field: 'codigoActividad', order: -1 }])
    })
  })

  describe('rowClass para filas inactivas', () => {
    it('aplica row-inactive a filas con activo !== S', () => {
      const dt = wrapper.findComponent(stubs.DataTable)
      const rowClassFn = dt.props('rowClass')

      expect(rowClassFn(mockRows[0])).toEqual({ 'row-inactive': false }) // activo = 'S'
      expect(rowClassFn(mockRows[1])).toEqual({ 'row-inactive': true })  // activo = 'N'
    })
  })

  describe('acciones de botones', () => {
    it('onAdd abre AltaDialog', async () => {
      const actions = wrapper.findComponent(stubs.FmGridActions)
      await actions.vm.$emit('add')
      await wrapper.vm.$nextTick()

      // El componente AltaDialog debería recibir visible=true
      const altaDialog = wrapper.findComponent({ name: 'default' })
      // Verificamos que el estado interno cambió
      expect((wrapper.vm as any).showAltaDialog).toBe(true)
    })

    it('onEdit no abre dialog sin fila seleccionada', async () => {
      const actions = wrapper.findComponent(stubs.FmGridActions)
      await actions.vm.$emit('edit')
      await wrapper.vm.$nextTick()

      expect((wrapper.vm as any).showModificarDialog).toBe(false)
    })

    it('onEdit abre ModificarDialog con fila seleccionada', async () => {
      store.setSelectedRow(mockRows[0])
      await wrapper.vm.$nextTick()

      const actions = wrapper.findComponent(stubs.FmGridActions)
      await actions.vm.$emit('edit')
      await wrapper.vm.$nextTick()

      expect((wrapper.vm as any).showModificarDialog).toBe(true)
    })
  })

  describe('exportación Excel', () => {
    it('no exporta si no hay filas', async () => {
      store.rows = []
      await wrapper.vm.$nextTick()

      const actions = wrapper.findComponent(stubs.FmGridActions)
      await actions.vm.$emit('export')

      expect(mockExportToExcel).not.toHaveBeenCalled()
    })

    it('exporta con nombre correcto y columnas definidas', async () => {
      store.rows = mockRows
      await wrapper.vm.$nextTick()

      const actions = wrapper.findComponent(stubs.FmGridActions)
      await actions.vm.$emit('export')

      expect(mockExportToExcel).toHaveBeenCalledTimes(1)
      expect(mockExportToExcel).toHaveBeenCalledWith({
        rows: mockRows,
        fields: mainColumns.map((c) => c.field),
        columns: mainColumns,
        filename: 'Configuracion_CMO_Actividad.xlsx',
      })
    })
  })

  describe('filtros', () => {
    it('inicializa filtros CONTAINS para cada columna', () => {
      const dt = wrapper.findComponent(stubs.DataTable)
      const filters = dt.props('filters')

      mainColumns.forEach((col) => {
        expect(filters[col.field]).toBeDefined()
        expect(filters[col.field].value).toBeNull()
        expect(filters[col.field].matchMode).toBe('contains')
      })
    })
  })

  describe('paginación', () => {
    it('inicia en página 0 con 100 filas por página', () => {
      const dt = wrapper.findComponent(stubs.DataTable)
      expect(dt.props('first')).toBe(0)
      expect(dt.props('rows')).toBe(100)
    })
  })
})
