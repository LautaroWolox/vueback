import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import FmGridShell from '@/components/shared/FmGridShell.vue'
import FmGridPaginator from '@/components/shared/FmGridPaginator.vue'
import FmTypingLoader from '@/components/shared/FmTypingLoader.vue'

describe('FmGridShell', () => {
  it('mantiene las clases compartidas requeridas por fm-global.css', () => {
    const wrapper = mount(FmGridShell, {
      slots: { default: '<div class="contenido">Contenido</div>' },
    })

    expect(wrapper.classes()).toEqual(expect.arrayContaining([
      'fm-grid-shell',
      'fm-ui-grid-shell',
      'fm-responsive-grid-shell',
    ]))
    expect(wrapper.find('.contenido').exists()).toBe(true)
  })

  it('muestra el loader estándar como overlay sin ocultar el contenido de la grilla', () => {
    const wrapper = mount(FmGridShell, {
      props: {
        loading: true,
        loadingTitle: 'Texto particular',
        loadingMessage: 'Mensaje particular',
      },
      slots: { default: '<div class="contenido">Grilla</div>' },
    })

    expect(wrapper.classes()).toContain('fm-grid-shell--loading')
    expect(wrapper.find('.contenido').exists()).toBe(true)
    const loader = wrapper.findComponent(FmTypingLoader)
    expect(loader.exists()).toBe(true)
    expect(loader.props('overlay')).toBe(true)
    expect(loader.text()).toContain('Cargando Información')
    expect(loader.text()).toContain('Preparando Grilla')
  })
})

describe('FmGridPaginator', () => {
  it('normaliza el cambio manual de página dentro de los límites', async () => {
    const wrapper = mount(FmGridPaginator, {
      props: {
        page: 0,
        pageCount: 5,
        rows: 100,
        totalRecords: 500,
        autoMaxRows: false,
      },
    })
    const input = wrapper.get('.fm-page-input')

    await input.setValue('99')
    await input.trigger('change')
    expect(wrapper.emitted('page-change')?.at(-1)).toEqual([4])
    expect(input.element.value).toBe('5')

    await input.setValue('0')
    await input.trigger('change')
    expect(wrapper.emitted('page-change')?.at(-1)).toEqual([0])
    expect(input.element.value).toBe('1')
  })

  it('emite las cuatro acciones de navegación', async () => {
    const wrapper = mount(FmGridPaginator, {
      props: {
        page: 1,
        pageCount: 4,
        rows: 100,
        autoMaxRows: false,
      },
    })

    await wrapper.get('[aria-label="Primera página"]').trigger('click')
    await wrapper.get('[aria-label="Página anterior"]').trigger('click')
    await wrapper.get('[aria-label="Página siguiente"]').trigger('click')
    await wrapper.get('[aria-label="Última página"]').trigger('click')

    expect(wrapper.emitted('first-page')).toHaveLength(1)
    expect(wrapper.emitted('prev-page')).toHaveLength(1)
    expect(wrapper.emitted('next-page')).toHaveLength(1)
    expect(wrapper.emitted('last-page')).toHaveLength(1)
  })

  it('deshabilita navegación cuando no hay páginas', () => {
    const wrapper = mount(FmGridPaginator, {
      props: { page: 0, pageCount: 0, autoMaxRows: false },
    })

    wrapper.findAll('.fm-page-button').forEach((button) => {
      expect(button.attributes()).toHaveProperty('disabled')
    })
    expect(wrapper.get('.fm-page-input').attributes()).toHaveProperty('disabled')
  })

  it('emite el nuevo tamaño de página como número', async () => {
    const wrapper = mount(FmGridPaginator, {
      props: {
        rows: 100,
        rowsOptions: [100, 250, 500],
        autoMaxRows: false,
      },
    })

    await wrapper.get('.fm-rows-select').setValue('500')

    expect(wrapper.emitted('rows-change')?.at(-1)).toEqual([500])
  })

  it('elimina opciones inválidas y duplicadas', () => {
    const wrapper = mount(FmGridPaginator, {
      props: {
        rows: 10,
        rowsOptions: [10, '10', 50, 0, -1, 'x'],
        autoMaxRows: false,
      },
    })

    expect(wrapper.findAll('.fm-rows-select option').map((option) => option.text())).toEqual(['10', '50'])
  })

  it('conserva el contador compartido o permite uno explícito', async () => {
    const wrapper = mount(FmGridPaginator, {
      props: {
        last: 100,
        totalRecords: 350,
        autoMaxRows: false,
      },
    })

    expect(wrapper.get('.fm-custom-paginator__counter').text()).toBe('Mostrando 100 de 350')

    await wrapper.setProps({ counterText: '100 / 350 registros' })
    expect(wrapper.get('.fm-custom-paginator__counter').text()).toBe('100 / 350 registros')
  })

  it('selecciona automáticamente la opción máxima cuando la configuración lo solicita', async () => {
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0)
      return 1
    })

    const wrapper = mount(FmGridPaginator, {
      props: {
        rows: 100,
        rowsOptions: [100, 250, 500],
        autoMaxRows: true,
      },
    })
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('rows-change')).toContainEqual([500])
    raf.mockRestore()
  })
})
