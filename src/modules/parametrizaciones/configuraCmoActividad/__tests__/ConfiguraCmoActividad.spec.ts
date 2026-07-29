import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ConfiguraCmoActividad from '../ConfiguraCmoActividad.vue'
import { useCmoActividadStore } from '../store/cmoActividadStore'

// Mock del componente Tabla (no necesitamos renderizarlo completo en este test)
vi.mock('../components/Tabla.vue', () => ({
  default: { template: '<div data-testid="tabla-mock">Tabla</div>', name: 'Tabla' },
}))

// Mock de FmButton (componente global)
const FmButton = {
  template: '<button :disabled="disabled || loading" @click="$emit(\'click\', $event)"><slot />{{ label }}</button>',
  props: ['label', 'disabled', 'loading', 'class'],
  emits: ['click'],
}

describe('ConfiguraCmoActividad.vue', () => {
  let wrapper: ReturnType<typeof mount>
  let store: ReturnType<typeof useCmoActividadStore>

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)

    wrapper = mount(ConfiguraCmoActividad, {
      global: {
        plugins: [pinia],
        stubs: {
          FmButton,
        },
      },
    })

    store = useCmoActividadStore()
    vi.clearAllMocks()
  })

  describe('renderizado inicial', () => {
    it('muestra el panel de filtros expandido', () => {
      const filtersPanel = wrapper.find('.jobtype-panel--filters')
      expect(filtersPanel.exists()).toBe(true)

      const filtersHeader = filtersPanel.find('.jobtype-panel__header')
      expect(filtersHeader.attributes('aria-expanded')).toBe('true')
    })

    it('muestra el panel de resultados colapsado', () => {
      const resultsPanel = wrapper.find('.jobtype-panel--results')
      expect(resultsPanel.exists()).toBe(true)

      const resultsHeader = resultsPanel.find('.jobtype-panel__header')
      expect(resultsHeader.attributes('aria-expanded')).toBe('false')
    })

    it('muestra el título FILTROS DE BÚSQUEDA', () => {
      const header = wrapper.find('.jobtype-panel--filters .jobtype-panel__header span')
      expect(header.text()).toBe('FILTROS DE BÚSQUEDA')
    })

    it('muestra el título RELACIONES CMO-ACTIVIDAD', () => {
      const header = wrapper.find('.jobtype-panel--results .jobtype-panel__header span')
      expect(header.text()).toBe('RELACIONES CMO-ACTIVIDAD')
    })

    it('renderiza el botón BUSCAR', () => {
      const button = wrapper.findComponent(FmButton)
      expect(button.exists()).toBe(true)
      expect(button.props('label')).toBe('BUSCAR')
    })

    it('renderiza el componente Tabla', () => {
      const tabla = wrapper.find('[data-testid="tabla-mock"]')
      expect(tabla.exists()).toBe(true)
    })

    it('usa la clase jobtype-screen como contenedor', () => {
      expect(wrapper.find('.jobtype-screen').exists()).toBe(true)
    })
  })

  describe('interacción de paneles (accordion)', () => {
    it('colapsa el panel de filtros al hacer click en su header', async () => {
      const filtersHeader = wrapper.find('.jobtype-panel--filters .jobtype-panel__header')

      await filtersHeader.trigger('click')

      expect(filtersHeader.attributes('aria-expanded')).toBe('false')
    })

    it('expande el panel de resultados al hacer click en su header', async () => {
      const resultsHeader = wrapper.find('.jobtype-panel--results .jobtype-panel__header')

      await resultsHeader.trigger('click')

      expect(resultsHeader.attributes('aria-expanded')).toBe('true')
    })
  })

  describe('botón BUSCAR', () => {
    it('expande el panel de resultados al buscar', async () => {
      // Mock fetchData para que no haga la request real
      store.fetchData = vi.fn().mockResolvedValue(undefined)

      const button = wrapper.findComponent(FmButton)
      await button.trigger('click')

      const resultsHeader = wrapper.find('.jobtype-panel--results .jobtype-panel__header')
      expect(resultsHeader.attributes('aria-expanded')).toBe('true')
    })

    it('llama store.fetchData al hacer click', async () => {
      store.fetchData = vi.fn().mockResolvedValue(undefined)

      const button = wrapper.findComponent(FmButton)
      await button.trigger('click')

      expect(store.fetchData).toHaveBeenCalledTimes(1)
    })

    it('pasa loading al botón', async () => {
      store.loading = true
      await wrapper.vm.$nextTick()

      const button = wrapper.findComponent(FmButton)
      expect(button.props('loading')).toBe(true)
    })
  })

  describe('cleanup al desmontar', () => {
    it('llama store.clearStore al destruir el componente', () => {
      store.clearStore = vi.fn()

      wrapper.unmount()

      expect(store.clearStore).toHaveBeenCalledTimes(1)
    })

    it('libera las filas del store al salir de la pantalla', () => {
      store.rows = [
        { actividadManoObraId: 1, codigoActividad: 'A', descActividad: 'B', codigoS4: 'C', cmo: 'D', usuarioModificacion: 'E', fechaModificacion: 'F', activo: 'S' },
      ]

      wrapper.unmount()

      expect(store.rows).toEqual([])
      expect(store.selectedRow).toBeNull()
    })
  })
})
