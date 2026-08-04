import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AltaDialog from '../components/AltaDialog.vue'
import { useCmoActividadStore } from '../store/cmoActividadStore'

// Mock useFetch
vi.mock('@vueuse/core', () => ({
  useFetch: vi.fn(() => ({
    json: () => Promise.resolve({ data: { value: [] }, error: { value: null } }),
  })),
}))

// Mock PrimeVue services
const mockConfirmRequire = vi.fn()
vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => ({ require: mockConfirmRequire }),
}))

const mockToastAdd = vi.fn()
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: mockToastAdd }),
}))

// Stubs
const stubs = {
  Dialog: {
    template: '<div class="dialog-stub" v-if="visible"><slot name="header" /><slot /><slot name="footer" /></div>',
    props: ['visible', 'modal', 'closable', 'draggable', 'resizable', 'appendTo'],
    emits: ['update:visible', 'hide'],
  },
  AutoComplete: {
    template: '<input class="autocomplete-stub" :data-field="optionLabel" />',
    props: ['modelValue', 'suggestions', 'optionLabel', 'minLength', 'loading', 'placeholder'],
    emits: ['update:modelValue', 'complete'],
  },
  DataTable: {
    template: '<div class="datatable-stub"><slot name="empty" /><slot name="paginatorcontainer" v-bind="paginatorProps" /><slot /></div>',
    props: ['value', 'dataKey', 'selection', 'first', 'rows', 'selectionMode', 'paginator'],
    emits: ['update:selection', 'update:first', 'update:rows', 'row-click'],
    computed: {
      paginatorProps() {
        return { first: 0, last: 10, page: 0, pageCount: 1, rows: 10, totalRecords: 0, firstPageCallback: () => {}, lastPageCallback: () => {}, prevPageCallback: () => {}, nextPageCallback: () => {}, rowChangeCallback: () => {}, changePageCallback: () => {} }
      },
    },
  },
  Column: { template: '<div class="column-stub"></div>', props: ['field', 'header'] },
  FmButton: {
    template: '<button class="fm-button-stub" :disabled="disabled" @click="$emit(\'click\', $event)">{{ label }}</button>',
    props: ['label', 'disabled', 'class'],
    emits: ['click'],
  },
  FmGridPaginator: { template: '<div class="paginator-stub"><slot name="actions" /></div>', props: ['first', 'last', 'page', 'pageCount', 'rows', 'totalRecords', 'rowsOptions', 'showRowsSelect', 'showCounter', 'pageLabel'] },
  FmGridActions: {
    template: '<div class="actions-stub"></div>',
    props: ['size', 'showExport', 'showDelete', 'showRefresh', 'deleteDisabled', 'deleteTitle'],
    emits: ['delete'],
  },
}

describe('AltaDialog.vue', () => {
  let wrapper: ReturnType<typeof mount>
  let store: ReturnType<typeof useCmoActividadStore>

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    store = useCmoActividadStore()

    wrapper = mount(AltaDialog, {
      props: {
        visible: true,
      },
      global: {
        plugins: [pinia],
        stubs,
      },
    })

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('renderizado', () => {
    it('muestra el dialog cuando visible=true', () => {
      expect(wrapper.find('.dialog-stub').exists()).toBe(true)
    })

    it('no muestra el dialog cuando visible=false', async () => {
      await wrapper.setProps({ visible: false })
      expect(wrapper.find('.dialog-stub').exists()).toBe(false)
    })

    it('muestra el título "Alta CMO - Actividad"', () => {
      const title = wrapper.find('.jobtype-alta-header__title')
      expect(title.text()).toBe('Alta CMO - Actividad')
    })

    it('renderiza el campo Actividad con AutoComplete', () => {
      const label = wrapper.find('label[for="alta-actividad"]')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('Actividad')

      const autocompletes = wrapper.findAllComponents(stubs.AutoComplete)
      expect(autocompletes.length).toBeGreaterThanOrEqual(1)
    })

    it('renderiza el campo CMO con AutoComplete', () => {
      const label = wrapper.find('label[for="alta-cmo"]')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('CMO')
    })

    it('autocompletes usan optionLabel="valor"', () => {
      const autocompletes = wrapper.findAll('.autocomplete-stub')
      autocompletes.forEach((ac) => {
        expect(ac.attributes('data-field')).toBe('valor')
      })
    })

    it('renderiza botón AGREGAR deshabilitado inicialmente', () => {
      const buttons = wrapper.findAll('.fm-button-stub')
      const agregar = buttons.find((b) => b.text() === 'AGREGAR')
      expect(agregar).toBeDefined()
      expect(agregar!.attributes('disabled')).toBeDefined()
    })

    it('renderiza botón RELACIONAR deshabilitado sin preview rows', () => {
      const buttons = wrapper.findAll('.fm-button-stub')
      const relacionar = buttons.find((b) => b.text() === 'RELACIONAR')
      expect(relacionar).toBeDefined()
      expect(relacionar!.attributes('disabled')).toBeDefined()
    })

    it('renderiza DataTable de preview con 4 columnas', () => {
      const columns = wrapper.findAllComponents(stubs.Column)
      expect(columns).toHaveLength(4)
    })

    it('muestra botón cerrar (×)', () => {
      const closeBtn = wrapper.find('.jobtype-alta-header__close')
      expect(closeBtn.exists()).toBe(true)
      expect(closeBtn.text()).toBe('×')
    })
  })

  describe('autocomplete - búsqueda', () => {
    it('llama store.searchActividad con debounce al emitir @complete', async () => {
      vi.useFakeTimers()
      const mockActividades = [
        { id: 1, codigo: 'ACT001', nombre: 'Instalación', activo: 'S', valor: 'ACT001 - Instalación' },
      ]
      store.searchActividad = vi.fn().mockResolvedValue(mockActividades)

      const autocompletes = wrapper.findAllComponents(stubs.AutoComplete)
      const actividadAC = autocompletes[0]
      await actividadAC.vm.$emit('complete', { query: 'ACT' })

      // Antes del debounce: no se llamó
      expect(store.searchActividad).not.toHaveBeenCalled()

      // Avanzar 300ms del debounce
      vi.advanceTimersByTime(300)
      await wrapper.vm.$nextTick()

      expect(store.searchActividad).toHaveBeenCalledWith('ACT')

      vi.useRealTimers()
    })

    it('llama store.searchCmo con debounce al emitir @complete', async () => {
      vi.useFakeTimers()
      const mockCmos = [
        { id: 10, codigoS4: 'S4001', nombre: 'CMO Norte', codigoR3: 'R3001', activo: 'S', valor: 'S4001 - CMO Norte' },
      ]
      store.searchCmo = vi.fn().mockResolvedValue(mockCmos)

      const autocompletes = wrapper.findAllComponents(stubs.AutoComplete)
      const cmoAC = autocompletes[1]
      await cmoAC.vm.$emit('complete', { query: 'CMO' })

      vi.advanceTimersByTime(300)
      await wrapper.vm.$nextTick()

      expect(store.searchCmo).toHaveBeenCalledWith('CMO')

      vi.useRealTimers()
    })
  })

  describe('agregar a preview', () => {
    it('botón AGREGAR se habilita cuando ambos autocompletes tienen objetos seleccionados', async () => {
      const autocompletes = wrapper.findAllComponents(stubs.AutoComplete)

      // Simular selección de actividad (objeto, no string)
      await autocompletes[0].vm.$emit('update:modelValue', {
        id: 1, codigo: 'ACT001', nombre: 'Instalación', activo: 'S', valor: 'ACT001 - Instalación',
      })
      // Simular selección de CMO (objeto, no string)
      await autocompletes[1].vm.$emit('update:modelValue', {
        id: 10, codigoS4: 'S4001', nombre: 'CMO Norte', codigoR3: 'R3001', activo: 'S', valor: 'S4001 - CMO Norte',
      })
      await wrapper.vm.$nextTick()

      const buttons = wrapper.findAll('.fm-button-stub')
      const agregar = buttons.find((b) => b.text() === 'AGREGAR')
      expect(agregar!.attributes('disabled')).toBeUndefined()
    })

    it('AGREGAR no se habilita si solo hay texto (no objeto seleccionado)', async () => {
      const autocompletes = wrapper.findAllComponents(stubs.AutoComplete)

      // Solo string, no un objeto seleccionado del dropdown
      await autocompletes[0].vm.$emit('update:modelValue', 'texto libre')
      await autocompletes[1].vm.$emit('update:modelValue', 'otro texto')
      await wrapper.vm.$nextTick()

      const buttons = wrapper.findAll('.fm-button-stub')
      const agregar = buttons.find((b) => b.text() === 'AGREGAR')
      expect(agregar!.attributes('disabled')).toBeDefined()
    })

    it('agregar crea fila en preview y limpia los campos', async () => {
      const autocompletes = wrapper.findAllComponents(stubs.AutoComplete)

      await autocompletes[0].vm.$emit('update:modelValue', {
        id: 1, codigo: 'ACT001', nombre: 'Instalación', activo: 'S', valor: 'ACT001 - Instalación',
      })
      await autocompletes[1].vm.$emit('update:modelValue', {
        id: 10, codigoS4: 'S4001', nombre: 'CMO Norte', codigoR3: 'R3001', activo: 'S', valor: 'S4001 - CMO Norte',
      })
      await wrapper.vm.$nextTick()

      const buttons = wrapper.findAll('.fm-button-stub')
      const agregar = buttons.find((b) => b.text() === 'AGREGAR')
      await agregar!.trigger('click')
      await wrapper.vm.$nextTick()

      // La grilla preview debería tener 1 fila
      const dt = wrapper.findComponent(stubs.DataTable)
      expect(dt.props('value')).toHaveLength(1)
      expect(dt.props('value')[0].codigoActividad).toBe('ACT001')
      expect(dt.props('value')[0].codigoS4).toBe('S4001')
    })

    it('no agrega duplicados (misma actividad + mismo CMO)', async () => {
      const autocompletes = wrapper.findAllComponents(stubs.AutoComplete)
      const actividad = { id: 1, codigo: 'ACT001', nombre: 'Instalación', activo: 'S', valor: 'ACT001 - Instalación' }
      const cmo = { id: 10, codigoS4: 'S4001', nombre: 'CMO Norte', codigoR3: 'R3001', activo: 'S', valor: 'S4001 - CMO Norte' }

      // Agregar primera vez
      await autocompletes[0].vm.$emit('update:modelValue', actividad)
      await autocompletes[1].vm.$emit('update:modelValue', cmo)
      await wrapper.vm.$nextTick()
      const buttons = wrapper.findAll('.fm-button-stub')
      const agregar = buttons.find((b) => b.text() === 'AGREGAR')
      await agregar!.trigger('click')
      await wrapper.vm.$nextTick()

      // Intentar agregar de nuevo con mismos IDs
      await autocompletes[0].vm.$emit('update:modelValue', actividad)
      await autocompletes[1].vm.$emit('update:modelValue', cmo)
      await wrapper.vm.$nextTick()
      await agregar!.trigger('click')
      await wrapper.vm.$nextTick()

      const dt = wrapper.findComponent(stubs.DataTable)
      expect(dt.props('value')).toHaveLength(1) // No duplica
    })
  })

  describe('RELACIONAR', () => {
    it('botón RELACIONAR se habilita cuando hay filas en preview', async () => {
      // Agregar una fila
      const autocompletes = wrapper.findAllComponents(stubs.AutoComplete)
      await autocompletes[0].vm.$emit('update:modelValue', {
        id: 1, codigo: 'ACT001', nombre: 'Instalación', activo: 'S', valor: 'ACT001 - Instalación',
      })
      await autocompletes[1].vm.$emit('update:modelValue', {
        id: 10, codigoS4: 'S4001', nombre: 'CMO Norte', codigoR3: 'R3001', activo: 'S', valor: 'S4001 - CMO Norte',
      })
      await wrapper.vm.$nextTick()
      const buttons = wrapper.findAll('.fm-button-stub')
      const agregar = buttons.find((b) => b.text() === 'AGREGAR')
      await agregar!.trigger('click')
      await wrapper.vm.$nextTick()

      const relacionar = buttons.find((b) => b.text() === 'RELACIONAR')
      expect(relacionar!.attributes('disabled')).toBeUndefined()
    })

    it('llama store.crearRelaciones y emite saved en éxito', async () => {
      store.crearRelaciones = vi.fn().mockResolvedValue([])

      // Agregar fila
      const autocompletes = wrapper.findAllComponents(stubs.AutoComplete)
      await autocompletes[0].vm.$emit('update:modelValue', {
        id: 1, codigo: 'ACT001', nombre: 'Instalación', activo: 'S', valor: 'ACT001 - Instalación',
      })
      await autocompletes[1].vm.$emit('update:modelValue', {
        id: 10, codigoS4: 'S4001', nombre: 'CMO Norte', codigoR3: 'R3001', activo: 'S', valor: 'S4001 - CMO Norte',
      })
      await wrapper.vm.$nextTick()
      const buttons = wrapper.findAll('.fm-button-stub')
      await buttons.find((b) => b.text() === 'AGREGAR')!.trigger('click')
      await wrapper.vm.$nextTick()

      // Click RELACIONAR
      await buttons.find((b) => b.text() === 'RELACIONAR')!.trigger('click')
      await wrapper.vm.$nextTick()

      expect(store.crearRelaciones).toHaveBeenCalledTimes(1)
      expect(store.crearRelaciones).toHaveBeenCalledWith([
        expect.objectContaining({
          idActividad: 1,
          idCmo: 10,
          codigoActividad: 'ACT001',
          descActividad: 'Instalación',
          codigoS4: 'S4001',
        }),
      ])

      // Debería emitir saved y cerrar
      expect(wrapper.emitted('saved')).toBeTruthy()
      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false])
      expect(mockToastAdd).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }))
    })

    it('muestra errores de negocio inline sin cerrar', async () => {
      const errorResponses = [
        { mensaje: 'Relación duplicada', actividadId: 1, manoObraId: 10, actividadNombre: null, manoObraNombre: null, actividadCodigo: null, manoObraCodigo: null },
      ]
      store.crearRelaciones = vi.fn().mockResolvedValue(errorResponses)

      // Agregar fila y relacionar
      const autocompletes = wrapper.findAllComponents(stubs.AutoComplete)
      await autocompletes[0].vm.$emit('update:modelValue', {
        id: 1, codigo: 'ACT001', nombre: 'Instalación', activo: 'S', valor: 'ACT001 - Instalación',
      })
      await autocompletes[1].vm.$emit('update:modelValue', {
        id: 10, codigoS4: 'S4001', nombre: 'CMO Norte', codigoR3: 'R3001', activo: 'S', valor: 'S4001 - CMO Norte',
      })
      await wrapper.vm.$nextTick()
      const buttons = wrapper.findAll('.fm-button-stub')
      await buttons.find((b) => b.text() === 'AGREGAR')!.trigger('click')
      await wrapper.vm.$nextTick()
      await buttons.find((b) => b.text() === 'RELACIONAR')!.trigger('click')
      await wrapper.vm.$nextTick()

      // No cierra el dialog
      expect(wrapper.emitted('update:visible')).toBeFalsy()
      // Muestra errores inline
      const errors = wrapper.findAll('.cmo-alta-errors__item')
      expect(errors).toHaveLength(1)
      expect(errors[0].text()).toBe('Relación duplicada')
    })

    it('muestra toast de error en fallo de red', async () => {
      store.crearRelaciones = vi.fn().mockRejectedValue(new Error('Network Error'))

      // Agregar fila y relacionar
      const autocompletes = wrapper.findAllComponents(stubs.AutoComplete)
      await autocompletes[0].vm.$emit('update:modelValue', {
        id: 1, codigo: 'ACT001', nombre: 'Instalación', activo: 'S', valor: 'ACT001 - Instalación',
      })
      await autocompletes[1].vm.$emit('update:modelValue', {
        id: 10, codigoS4: 'S4001', nombre: 'CMO Norte', codigoR3: 'R3001', activo: 'S', valor: 'S4001 - CMO Norte',
      })
      await wrapper.vm.$nextTick()
      const buttons = wrapper.findAll('.fm-button-stub')
      await buttons.find((b) => b.text() === 'AGREGAR')!.trigger('click')
      await wrapper.vm.$nextTick()
      await buttons.find((b) => b.text() === 'RELACIONAR')!.trigger('click')
      await wrapper.vm.$nextTick()

      expect(mockToastAdd).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }))
    })
  })

  describe('cerrar dialog', () => {
    it('cierra directamente si no hay datos en preview', async () => {
      const closeBtn = wrapper.find('.jobtype-alta-header__close')
      await closeBtn.trigger('click')

      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false])
      expect(mockConfirmRequire).not.toHaveBeenCalled()
    })

    it('muestra confirmación si hay datos en preview', async () => {
      // Agregar fila primero
      const autocompletes = wrapper.findAllComponents(stubs.AutoComplete)
      await autocompletes[0].vm.$emit('update:modelValue', {
        id: 1, codigo: 'ACT001', nombre: 'Instalación', activo: 'S', valor: 'ACT001 - Instalación',
      })
      await autocompletes[1].vm.$emit('update:modelValue', {
        id: 10, codigoS4: 'S4001', nombre: 'CMO Norte', codigoR3: 'R3001', activo: 'S', valor: 'S4001 - CMO Norte',
      })
      await wrapper.vm.$nextTick()
      const buttons = wrapper.findAll('.fm-button-stub')
      await buttons.find((b) => b.text() === 'AGREGAR')!.trigger('click')
      await wrapper.vm.$nextTick()

      // Intentar cerrar
      const closeBtn = wrapper.find('.jobtype-alta-header__close')
      await closeBtn.trigger('click')

      expect(mockConfirmRequire).toHaveBeenCalledTimes(1)
      expect(mockConfirmRequire).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Hay datos ingresados, confirma que desea cancelar?',
        })
      )
    })
  })

  describe('eliminar de preview', () => {
    it('elimina la fila seleccionada del preview', async () => {
      // Agregar una fila
      const autocompletes = wrapper.findAllComponents(stubs.AutoComplete)
      await autocompletes[0].vm.$emit('update:modelValue', {
        id: 1, codigo: 'ACT001', nombre: 'Instalación', activo: 'S', valor: 'ACT001 - Instalación',
      })
      await autocompletes[1].vm.$emit('update:modelValue', {
        id: 10, codigoS4: 'S4001', nombre: 'CMO Norte', codigoR3: 'R3001', activo: 'S', valor: 'S4001 - CMO Norte',
      })
      await wrapper.vm.$nextTick()
      const buttons = wrapper.findAll('.fm-button-stub')
      await buttons.find((b) => b.text() === 'AGREGAR')!.trigger('click')
      await wrapper.vm.$nextTick()

      // Verificar que hay 1 fila
      const dt = wrapper.findComponent(stubs.DataTable)
      expect(dt.props('value')).toHaveLength(1)

      // Simular selección de la fila (row-click)
      const fila = dt.props('value')[0]
      await dt.vm.$emit('row-click', { data: fila })
      await wrapper.vm.$nextTick()

      // Emitir delete desde FmGridActions
      const actions = wrapper.findComponent(stubs.FmGridActions)
      await actions.vm.$emit('delete')
      await wrapper.vm.$nextTick()

      expect(dt.props('value')).toHaveLength(0)
    })
  })
})
