import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ModificarDialog from '../components/ModificarDialog.vue'
import { useCmoActividadStore } from '../store/cmoActividadStore'
import type { RelCmoActividad } from '../store/types'

// Mock useFetch
vi.mock('@vueuse/core', () => ({
  useFetch: vi.fn(() => ({
    json: () => Promise.resolve({ data: { value: null }, error: { value: null } }),
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
  InputText: {
    template: '<input class="inputtext-stub" :value="modelValue" :disabled="disabled" />',
    props: ['modelValue', 'disabled', 'id'],
  },
  FmButton: {
    template: '<button class="fm-button-stub" :disabled="disabled" @click="$emit(\'click\', $event)">{{ label }}</button>',
    props: ['label', 'disabled', 'class'],
    emits: ['click'],
  },
}

const mockRelacion: RelCmoActividad = {
  actividadManoObraId: 42,
  codigoActividad: 'ACT001',
  descActividad: 'Instalación HFC',
  codigoS4: 'S4001',
  cmo: 'CMO Norte',
  usuarioModificacion: 'usuario1',
  fechaModificacion: '01/01/2025 10:00:00',
  activo: 'S',
}

describe('ModificarDialog.vue', () => {
  let wrapper: ReturnType<typeof mount>
  let store: ReturnType<typeof useCmoActividadStore>

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    store = useCmoActividadStore()

    wrapper = mount(ModificarDialog, {
      props: {
        visible: true,
        relacion: mockRelacion,
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

    it('muestra el título "Modificar CMO - Actividad"', () => {
      const title = wrapper.find('.jobtype-alta-header__title')
      expect(title.text()).toBe('Modificar CMO - Actividad')
    })

    it('muestra botón cerrar (×)', () => {
      const closeBtn = wrapper.find('.jobtype-alta-header__close')
      expect(closeBtn.exists()).toBe(true)
      expect(closeBtn.text()).toBe('×')
    })
  })

  describe('campos readonly', () => {
    it('muestra campo Actividad con valor compuesto y disabled', () => {
      const label = wrapper.find('label[for="mod-actividad"]')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('Actividad')

      const inputs = wrapper.findAllComponents(stubs.InputText)
      const actividadInput = inputs.find((i) => i.props('id') === 'mod-actividad')
      expect(actividadInput).toBeDefined()
      expect(actividadInput!.attributes('disabled')).toBeDefined()
      expect(actividadInput!.props('modelValue')).toBe('ACT001 - Instalación HFC')
    })

    it('muestra campo CMO actual con valor compuesto y disabled', () => {
      const label = wrapper.find('label[for="mod-cmo-actual"]')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('CMO actual')

      const inputs = wrapper.findAllComponents(stubs.InputText)
      const cmoInput = inputs.find((i) => i.props('id') === 'mod-cmo-actual')
      expect(cmoInput).toBeDefined()
      expect(cmoInput!.attributes('disabled')).toBeDefined()
      expect(cmoInput!.props('modelValue')).toBe('S4001 - CMO Norte')
    })

    it('muestra campos vacíos si relacion es null', async () => {
      await wrapper.setProps({ relacion: null })
      await wrapper.vm.$nextTick()

      const inputs = wrapper.findAllComponents(stubs.InputText)
      const actividadInput = inputs.find((i) => i.props('id') === 'mod-actividad')
      expect(actividadInput!.props('modelValue')).toBe('')
    })
  })

  describe('autocomplete nuevo CMO', () => {
    it('renderiza campo Nuevo CMO con AutoComplete', () => {
      const label = wrapper.find('label[for="mod-nuevo-cmo"]')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('Nuevo CMO')

      const ac = wrapper.findComponent(stubs.AutoComplete)
      expect(ac.exists()).toBe(true)
      expect(ac.props('optionLabel')).toBe('valor')
      expect(ac.props('minLength')).toBe(3)
    })

    it('llama store.searchCmo con debounce 300ms', async () => {
      vi.useFakeTimers()
      const mockCmos = [
        { id: 20, codigoS4: 'S4002', nombre: 'CMO Sur', codigoR3: 'R3002', activo: 'S', valor: 'S4002 - CMO Sur' },
      ]
      store.searchCmo = vi.fn().mockResolvedValue(mockCmos)

      const ac = wrapper.findComponent(stubs.AutoComplete)
      await ac.vm.$emit('complete', { query: 'CMO' })

      expect(store.searchCmo).not.toHaveBeenCalled()

      vi.advanceTimersByTime(300)
      await wrapper.vm.$nextTick()

      expect(store.searchCmo).toHaveBeenCalledWith('CMO')

      vi.useRealTimers()
    })
  })

  describe('botón ACTUALIZAR', () => {
    it('deshabilitado inicialmente (sin CMO seleccionado)', () => {
      const buttons = wrapper.findAll('.fm-button-stub')
      const actualizar = buttons.find((b) => b.text() === 'ACTUALIZAR')
      expect(actualizar).toBeDefined()
      expect(actualizar!.attributes('disabled')).toBeDefined()
    })

    it('se habilita cuando se selecciona un objeto CMO', async () => {
      const ac = wrapper.findComponent(stubs.AutoComplete)
      await ac.vm.$emit('update:modelValue', {
        id: 20, codigoS4: 'S4002', nombre: 'CMO Sur', codigoR3: 'R3002', activo: 'S', valor: 'S4002 - CMO Sur',
      })
      await wrapper.vm.$nextTick()

      const buttons = wrapper.findAll('.fm-button-stub')
      const actualizar = buttons.find((b) => b.text() === 'ACTUALIZAR')
      expect(actualizar!.attributes('disabled')).toBeUndefined()
    })

    it('no se habilita si solo hay texto (no objeto)', async () => {
      const ac = wrapper.findComponent(stubs.AutoComplete)
      await ac.vm.$emit('update:modelValue', 'texto libre')
      await wrapper.vm.$nextTick()

      const buttons = wrapper.findAll('.fm-button-stub')
      const actualizar = buttons.find((b) => b.text() === 'ACTUALIZAR')
      expect(actualizar!.attributes('disabled')).toBeDefined()
    })
  })

  describe('flujo ACTUALIZAR', () => {
    it('llama store.modificarRelacion con IDs correctos y emite saved en éxito', async () => {
      store.modificarRelacion = vi.fn().mockResolvedValue(null) // null = sin error

      const ac = wrapper.findComponent(stubs.AutoComplete)
      await ac.vm.$emit('update:modelValue', {
        id: 20, codigoS4: 'S4002', nombre: 'CMO Sur', codigoR3: 'R3002', activo: 'S', valor: 'S4002 - CMO Sur',
      })
      await wrapper.vm.$nextTick()

      const buttons = wrapper.findAll('.fm-button-stub')
      const actualizar = buttons.find((b) => b.text() === 'ACTUALIZAR')
      await actualizar!.trigger('click')
      await wrapper.vm.$nextTick()

      expect(store.modificarRelacion).toHaveBeenCalledWith(42, 20)
      expect(wrapper.emitted('saved')).toBeTruthy()
      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false])
      expect(mockToastAdd).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }))
    })

    it('muestra error de negocio inline sin cerrar', async () => {
      store.modificarRelacion = vi.fn().mockResolvedValue({
        mensaje: 'Relación repetida',
        actividadId: 42,
        manoObraId: 20,
        actividadNombre: null,
        manoObraNombre: null,
        actividadCodigo: null,
        manoObraCodigo: null,
      })

      const ac = wrapper.findComponent(stubs.AutoComplete)
      await ac.vm.$emit('update:modelValue', {
        id: 20, codigoS4: 'S4002', nombre: 'CMO Sur', codigoR3: 'R3002', activo: 'S', valor: 'S4002 - CMO Sur',
      })
      await wrapper.vm.$nextTick()

      const buttons = wrapper.findAll('.fm-button-stub')
      await buttons.find((b) => b.text() === 'ACTUALIZAR')!.trigger('click')
      await wrapper.vm.$nextTick()

      // No cierra
      expect(wrapper.emitted('update:visible')).toBeFalsy()
      // Muestra error inline
      const error = wrapper.find('.cmo-modificar-error__item')
      expect(error.exists()).toBe(true)
      expect(error.text()).toBe('Relación repetida')
    })

    it('muestra toast de error en fallo de red', async () => {
      store.modificarRelacion = vi.fn().mockRejectedValue(new Error('Network Error'))

      const ac = wrapper.findComponent(stubs.AutoComplete)
      await ac.vm.$emit('update:modelValue', {
        id: 20, codigoS4: 'S4002', nombre: 'CMO Sur', codigoR3: 'R3002', activo: 'S', valor: 'S4002 - CMO Sur',
      })
      await wrapper.vm.$nextTick()

      const buttons = wrapper.findAll('.fm-button-stub')
      await buttons.find((b) => b.text() === 'ACTUALIZAR')!.trigger('click')
      await wrapper.vm.$nextTick()

      expect(mockToastAdd).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }))
    })
  })

  describe('cerrar dialog', () => {
    it('cierra directamente si no hay CMO seleccionado', async () => {
      const closeBtn = wrapper.find('.jobtype-alta-header__close')
      await closeBtn.trigger('click')

      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false])
      expect(mockConfirmRequire).not.toHaveBeenCalled()
    })

    it('muestra confirmación si hay CMO seleccionado', async () => {
      const ac = wrapper.findComponent(stubs.AutoComplete)
      await ac.vm.$emit('update:modelValue', {
        id: 20, codigoS4: 'S4002', nombre: 'CMO Sur', codigoR3: 'R3002', activo: 'S', valor: 'S4002 - CMO Sur',
      })
      await wrapper.vm.$nextTick()

      const closeBtn = wrapper.find('.jobtype-alta-header__close')
      await closeBtn.trigger('click')

      expect(mockConfirmRequire).toHaveBeenCalledTimes(1)
      expect(mockConfirmRequire).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Hay datos ingresados, confirma que desea cancelar?',
        })
      )
    })

    it('no muestra confirmación si solo hay texto (no objeto)', async () => {
      const ac = wrapper.findComponent(stubs.AutoComplete)
      await ac.vm.$emit('update:modelValue', 'solo texto')
      await wrapper.vm.$nextTick()

      const closeBtn = wrapper.find('.jobtype-alta-header__close')
      await closeBtn.trigger('click')

      expect(mockConfirmRequire).not.toHaveBeenCalled()
      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false])
    })
  })

  describe('reseteo al abrir', () => {
    it('limpia el estado al cambiar visible de false a true', async () => {
      // Seleccionar un CMO
      const ac = wrapper.findComponent(stubs.AutoComplete)
      await ac.vm.$emit('update:modelValue', {
        id: 20, codigoS4: 'S4002', nombre: 'CMO Sur', codigoR3: 'R3002', activo: 'S', valor: 'S4002 - CMO Sur',
      })
      await wrapper.vm.$nextTick()

      // Cerrar y reabrir
      await wrapper.setProps({ visible: false })
      await wrapper.setProps({ visible: true })
      await wrapper.vm.$nextTick()

      // El autocomplete debería estar limpio (modelo reseteado)
      const buttons = wrapper.findAll('.fm-button-stub')
      const actualizar = buttons.find((b) => b.text() === 'ACTUALIZAR')
      expect(actualizar!.attributes('disabled')).toBeDefined()
    })
  })
})
